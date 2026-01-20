export interface Review {
  id: number;  // Изменено с string на number (согласно вашему JSON)
  title: string;
  text: string;
  rating: number;
}

// Функция для загрузки отзывов с бэкенда
export const fetchReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch('/api/reviews');  // Используем относительный путь

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Учитываем структуру ответа FastAPI: { items: Review[], total: number }
    if (data && data.items && Array.isArray(data.items)) {
      return data.items;
    } else if (Array.isArray(data)) {
      // Если ответ пришел как массив напрямую
      return data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return []; // Возвращаем пустой массив при ошибке
  }
};