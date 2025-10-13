import { useNavigate } from "react-router-dom"
import { useForm} from "react-hook-form";

export interface AuthProps{
    isLoginMode?: boolean;
    title?: string;
}
export const AuthNav: React.FC<AuthProps> = ({isLoginMode}) =>{
    const navigate = useNavigate()
    const { reset } = useForm();
    const onSwitchForm = () =>{
        if (isLoginMode) {
            navigate('/signup')
        }
        else{
            navigate('/login')
        }
        reset();
    }
    return(
        <>
        <div className="text-center text-sm text-gray-900">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
          <span 
            className="text-indigo-800 cursor-pointer hover:underline"
            onClick={(e) =>{
              e.preventDefault();
              onSwitchForm()
            }}>
            {isLoginMode ? "Sign Up" : "Login"}
          </span>
        </div>

        </>
    )
}