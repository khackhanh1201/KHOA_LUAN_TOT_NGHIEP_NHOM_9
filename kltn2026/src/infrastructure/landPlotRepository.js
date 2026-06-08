// src/infrastructure/landPlotRepository.js
export const landPlotRepository = {
  getMyLandPlots: async (ownerId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/land-plots/my-land-plots?ownerId=${ownerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Nếu có bảo mật JWT
        }
      });
      if (!response.ok) throw new Error('Không thể tải danh sách đất');
      return await response.ok ? response.json() : [];
    } catch (error) {
      console.error("Lỗi API:", error);
      throw error;
    }
  }
};