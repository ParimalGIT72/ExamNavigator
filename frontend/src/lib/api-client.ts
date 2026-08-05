import { IApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiClient {
  private static getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<IApiResponse<T>> {
    try {
      const data = await response.json();

      if (response.status === 401 && typeof window !== 'undefined') {
        // Handle unauthorized token expiration
        localStorage.removeItem('token');
      }

      if (!response.ok && !data.message) {
        return {
          success: false,
          message: `Request failed with status ${response.status}`,
          errorCode: `HTTP_${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to parse server response.',
        errorCode: 'PARSE_ERROR',
      };
    }
  }

  public static async get<T>(endpoint: string, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(headers),
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error occurred.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  public static async post<T>(endpoint: string, body?: unknown, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error occurred.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  public static async put<T>(endpoint: string, body?: unknown, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error occurred.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  public static async patch<T>(endpoint: string, body?: unknown, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error occurred.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  public static async delete<T>(endpoint: string, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(headers),
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error occurred.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }
}
