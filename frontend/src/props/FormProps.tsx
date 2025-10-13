import type{Path, UseFormRegister} from "react-hook-form";

export interface IFormInput{
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}


type InputProps = {
  label:Path<IFormInput>
  register: UseFormRegister<IFormInput> 
  type?: string
  placeholder: string
  rules?: object
}

export const Input = ({label, register, placeholder, type, rules}: InputProps) => (
  <>
    <label className="flex justify-start font-bold">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-100 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-900 dark:focus:ring-blue-500 dark:focus:border-blue-500"
      {... register(label,rules)} />
  </>
)