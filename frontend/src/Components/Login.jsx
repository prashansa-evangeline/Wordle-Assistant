import { useEffect, useState } from 'react';
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Login () {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const location = useLocation()
    const signUpMessage = location.state?.message
    const [loginmessage, setLoginmessage] = useState("")

    useEffect(() => {
        // Apply the background color when the component mounts
        document.body.style.backgroundColor = "black";
    
        // Revert the background color back to default when the component unmounts
        return () => {
          document.body.style.backgroundColor = '';
        };
    }, []);

    async function handleLogin() {
        try {
            const response = await axios.post("https://18.212.87.142:5000/auth/login", {
                username,
                password
            })
            localStorage.setItem('token', response.data.token);  // Store token in localStorage

            // Redirect to Game component upon successful login
            navigate("/game");
        } catch(error) {
            navigate("/")
            setLoginmessage("Invalid Credentials")
            console.error("Error Logging in", error)
        } 
    }

    return (
            <div className="flex justify-center items-center h-screen">
                <div className='flex flex-col sm:flex-row justify-center items-center'>
                    <div>
                        <div className='text-4xl text-center md:text-left md:text-6xl text-green-600 md:mr-24 mb-2'>
                        Wordle
                        </div>
                        <div className='text-xl text-center text-white md:text-left md:text-2xl md:mr-24 mt-2'>
                            Guess the Word for the Day!
                        </div>
                    </div>
                    <div>
                        {
                            signUpMessage && (<div  className='text-green-500 font-bold text-center'>
                                {signUpMessage}
                            </div>)
                        }
                        <div className="flex shadow-lg flex-col bg-white border border-gray rounded-lg p-4 m-2">
                            <input onChange={(e) => setUsername(e.target.value)} className="border rounded-md border-gray-300 m-2 p-2 w-80" type="text" placeholder="Username" />
                            <input onChange={(e) => setPassword(e.target.value)} className="border rounded-md border-gray-300 m-2 p-2 w-80" type="password" placeholder="Password" />
                            <button onClick={handleLogin} className="border bg-black font-bold text-white rounded-md border-gray-500 m-2 mt-4 p-2">
                                Log In
                            </button>
                            <hr className='m-4 broder-t border-gray-400'></hr>
                            <div className='text-center text-black-600'>
                                Do not have an account?
                            </div>
                            <Link to="/signup" className="border bg-green-600 font-bold text-white rounded-md text-center border-green-600 m-4 mt-4 p-2">
                                <button>Sign Up</button>
                            </Link>
                        </div>
                        {
                            loginmessage && (<div  className='text-red-500 font-bold text-center'>
                                {loginmessage}
                            </div>)
                        }
                    </div>
                </div>
            </div>
    )
}

export default Login