import apiClient from './api'

export const rolService = {
  async getRoles() {
    try {
      const resp = await apiClient.get('/RolRegistro')
      // API may return array or { data: [...] }
      if (Array.isArray(resp.data)) return resp.data
      if (resp.data && Array.isArray(resp.data.data)) return resp.data.data
      return []
    } catch (err) {
      console.error('Error fetching roles from API:', err)
      throw err
    }
  }
}
