import Foundation

class NetworkService: ObservableObject {
    @Published var whaleAlerts: [WhaleAlert] = []
    @Published var isLoading = false
    
    // CHANGE THIS TO YOUR LOCAL IP IF RUNNING ON REAL DEVICE
    // e.g., "http://192.168.1.50:3000/api/whale-alerts"
    private let baseURL = "http://localhost:3000/api/whale-alerts"
    
    func fetchWhaleAlerts() {
        guard let url = URL(string: baseURL) else { return }
        
        DispatchQueue.main.async { self.isLoading = true }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            defer { DispatchQueue.main.async { self?.isLoading = false } }
            
            if let error = error {
                print("Network error: \(error.localizedDescription)")
                return
            }
            
            guard let data = data else { return }
            
            do {
                let decoded = try JSONDecoder().decode(WhaleAlertResponse.self, from: data)
                DispatchQueue.main.async {
                    self?.whaleAlerts = decoded.alerts
                }
            } catch {
                print("Decoding error: \(error)")
            }
        }.resume()
    }
}
