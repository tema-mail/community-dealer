// Находит текст на фото встроенным распознаванием macOS (Vision) и печатает JSON по строке на файл:
// {"path": ..., "boxes": [{"text": ..., "x": ..., "y": ..., "w": ..., "h": ...}]}
// Координаты в долях кадра, начало – левый верхний угол. Решает, что размывать, scripts/photos.py.
// Запуск: swift scripts/plates.swift <файлы...>
import Foundation
import Vision
import AppKit

for path in CommandLine.arguments.dropFirst() {
    guard let image = NSImage(contentsOfFile: path),
          let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        FileHandle.standardError.write("не открылся файл: \(path)\n".data(using: .utf8)!)
        exit(1)
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["ru-RU", "en-US"]
    request.usesLanguageCorrection = false
    request.minimumTextHeight = 0.008
    try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([request])
    var boxes: [[String: Any]] = []
    for obs in request.results ?? [] {
        guard let top = obs.topCandidates(1).first else { continue }
        let b = obs.boundingBox
        boxes.append(["text": top.string, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height])
    }
    let line: [String: Any] = ["path": path, "boxes": boxes]
    if let data = try? JSONSerialization.data(withJSONObject: line), let s = String(data: data, encoding: .utf8) {
        print(s)
        fflush(stdout)
    }
}
