/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   api.ts                                               / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 18:06:42 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:17:47 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/main/services/api.ts
 * @description API service using Axios for all HTTP requests in the main process.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { log } from '@main/core'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_UDX_SERVER_URL_HTTPS,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
    'X-UDX-Secret': import.meta.env.VITE_UDX_SECRET
  }
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    log.main.info(`Sending ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    log.main.error(`Request error: ${error.message}`)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    log.main.info(`Received response with status ${response.status} from ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.response) {
      log.main.error(`Response error: ${error.response.status} - ${error.response.data}`)
    } else {
      log.main.error(`Response error: ${error.message}`)
    }
    return Promise.reject(error)
  }
)

export default apiClient
export { apiClient as api }
