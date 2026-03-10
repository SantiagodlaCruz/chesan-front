import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().required('El correo es obligatorio').email('Formato de correo inválido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'Mínimo 6 caracteres')
})
