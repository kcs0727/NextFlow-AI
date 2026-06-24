import axios from "@/lib/axios";

const TRANSLOADIT_ENDPOINT = "https://api2.transloadit.com";
const TRANSLOADIT_ASSEMBLIES_URL = `${TRANSLOADIT_ENDPOINT}/assemblies`;
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

type UploadSession = {
    accessToken: string;
    templateId: string;
};

type AssemblyResult = {
    ssl_url?: string | null;
    signed_ssl_url?: string | null;
    url?: string | null;
};

type AssemblyStatus = {
    ok?: string;
    error?: string;
    message?: string;
    assembly_id?: string;
    assembly_ssl_url?: string;
    uploads?: Array<{ ssl_url?: string | null; url?: string | null }>;
    results?: Record<string, AssemblyResult[]>;
};

function extractAssemblyResultUrl(assembly: AssemblyStatus | null | undefined): string | null {
    if (!assembly) return null;

    for (const upload of assembly.uploads ?? []) {
        if (upload.ssl_url) return upload.ssl_url;
        if (upload.url) return upload.url;
    }

    for (const entries of Object.values(assembly.results ?? {})) {
        for (const item of entries ?? []) {
            if (item.signed_ssl_url) return item.signed_ssl_url;
            if (item.ssl_url) return item.ssl_url;
            if (item.url) return item.url;
        }
    }

    return null;
}

async function waitForAssemblyCompletion(accessToken: string, assemblyId: string) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    for (; ;) {
        try {
            const { data: payload } = await axios.get<AssemblyStatus>(
                `${TRANSLOADIT_ASSEMBLIES_URL}/${assemblyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (payload?.ok !== "ASSEMBLY_UPLOADING" && payload?.ok !== "ASSEMBLY_EXECUTING") {
                return payload;
            }
        } catch (error: any) {
            const responseData = error.response?.data;
            throw new Error(
                responseData?.message ??
                responseData?.error ??
                error.message ??
                "Failed to fetch Transloadit assembly status"
            );
        }

        if (Date.now() >= deadline) {
            throw new Error("Timed out waiting for Transloadit to finish processing the file");
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
}

async function createUploadSession(mimeType: string): Promise<UploadSession> {
    try {
        const { data: payload } = await axios.post<{ accessToken?: string; templateId?: string; error?: string }>(
            "/api/workflows/transloadit/token",
            { mimeType }
        );

        if (!payload?.accessToken || !payload.templateId) {
            throw new Error("Transloadit upload session was incomplete");
        }

        return {
            accessToken: payload.accessToken,
            templateId: payload.templateId,
        };
    } catch (error: any) {
        const responseData = error.response?.data;
        throw new Error(
            responseData?.error ??
            error.message ??
            "Failed to create a Transloadit upload session"
        );
    }
}

export async function uploadViaTransloadit(
    file: File,
    acceptedMimes: string[],
): Promise<{ url: string; filename: string }> {
    if (!acceptedMimes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported`);
    }

    const session = await createUploadSession(file.type);

    const body = new FormData();
    body.append(
        "params",
        JSON.stringify({
            template_id: session.templateId,
            quiet: true,
        }),
    );
    body.append("file", file, file.name);

    let payload: AssemblyStatus | null = null;
    try {
        const { data } = await axios.post<AssemblyStatus>(
            TRANSLOADIT_ASSEMBLIES_URL,
            body,
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );
        payload = data;
    } catch (error: any) {
        const responseData = error.response?.data;
        throw new Error(
            responseData?.message ??
            responseData?.error ??
            error.message ??
            "Failed to upload file via Transloadit"
        );
    }

    if (!payload?.assembly_id) {
        throw new Error("Transloadit did not return an assembly ID");
    }

    const finalStatus =
        payload?.ok === "ASSEMBLY_COMPLETED" || payload?.ok === "ASSEMBLY_CANCELED"
            ? payload
            : await waitForAssemblyCompletion(session.accessToken, payload.assembly_id);

    if (finalStatus?.error) {
        throw new Error(finalStatus.message ?? finalStatus.error ?? "Transloadit upload failed");
    }

    const url = extractAssemblyResultUrl(finalStatus);
    if (!url) {
        throw new Error("Transloadit did not return a hosted URL");
    }

    return {
        url,
        filename: file.name,
    };
}
