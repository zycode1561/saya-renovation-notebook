import Foundation
import Vision
import ImageIO

// 本机只读 OCR：输出逐图文字与识别置信度，不修改来源图片。
for path in CommandLine.arguments.dropFirst() {
    var result: [String: Any] = ["path": path]
    do {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["zh-Hans", "en-US"]
        request.usesLanguageCorrection = true
        let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:])
        try handler.perform([request])
        let lines = (request.results ?? []).compactMap { observation -> [String: Any]? in
            guard let text = observation.topCandidates(1).first else { return nil }
            return ["text": text.string, "confidence": text.confidence,
                    "y": observation.boundingBox.minY, "x": observation.boundingBox.minX]
        }
        result["lines"] = lines
        result["text"] = lines.compactMap { $0["text"] as? String }.joined(separator: "\n")
    } catch {
        result["error"] = String(describing: error)
    }
    if let data = try? JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]),
       let json = String(data: data, encoding: .utf8) {
        print(json)
    }
}
