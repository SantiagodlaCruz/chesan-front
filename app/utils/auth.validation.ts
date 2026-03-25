import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().required('El correo es obligatorio').email('Formato de correo inválido'),
  password: yup.string().required('La contraseña es obligatoria').min(6, 'Mínimo 6 caracteres')
})

export const recoverySchema = yup.object({
  email: yup.string().required('El correo es obligatorio').email('Formato de correo inválido')
})

export const changePasswordSchema = yup.object({
  current_password: yup.string().required('Debe ingresar su contraseña actual').min(8, 'Mínimo 8 caracteres'),
  new_password: yup.string()
    .required('La nueva contraseña es obligatoria')
    .min(8, 'Mínimo 8 caracteres')
    .matches(/\d/, 'Debe contener al menos un número')
    .matches(/[!@#$%^&*(),.?':{}|<>]/, 'Debe contener al menos un símbolo especial')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula'),
  new_password_confirmation: yup.string()
    .required('Debe confirmar la contraseña')
    .oneOf([yup.ref('new_password')], 'Las contraseñas no coinciden')
})
