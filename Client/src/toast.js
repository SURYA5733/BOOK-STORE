// src/toast.js
import { toast } from 'react-toastify'

export const tSuccess = (msg) => toast.success(msg || 'Success')
export const tError = (msg) => toast.error(msg || 'Error')
export const tInfo  = (msg) => toast.info(msg || 'Info')
