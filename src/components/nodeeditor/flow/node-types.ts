import type { NodeTypes } from "@xyflow/react";
import TextNode from "@/components/nodeeditor/flow/nodes/text-node";
import UploadImageNode from "@/components/nodeeditor/flow/nodes/upload-image-node";
import UploadVideoNode from "@/components/nodeeditor/flow/nodes/upload-video-node";
import RunAnyLlmNode from "@/components/nodeeditor/flow/nodes/run-any-llm-node";
import CropImageNode from "@/components/nodeeditor/flow/nodes/crop-image-node";
import ExtractFrameNode from "@/components/nodeeditor/flow/nodes/extract-frame-node";

export const nodeTypes: NodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  runAnyLlm: RunAnyLlmNode,
  cropImage: CropImageNode,
  extractFrameFromVideo: ExtractFrameNode,
};
