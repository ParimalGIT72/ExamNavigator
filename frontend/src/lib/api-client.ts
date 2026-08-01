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

  public static async get<T>(endpoint: string, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(headers),
    });
    return response.json();
  }

  public static async post<T>(endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  public static async put<T>(endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  public static async patch<T>(endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  }

  public static async delete<T>(endpoint: string, headers: Record<string, string> = {}): Promise<IApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(headers),
    });
    return response.json();
  }
}
