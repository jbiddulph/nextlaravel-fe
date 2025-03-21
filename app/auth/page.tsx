"use client"
import React, { useEffect } from 'react';
import { myAppHook } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';

interface formData {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
}

const Auth: React.FC = () => {

    const [isLogin, setIsLogin] = React.useState(true);
    const [formData, setFormData] = React.useState<formData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const router = useRouter();
    const { login, register, authToken, isLoading } = myAppHook();

    useEffect(() => {
        if(authToken){
            router.push('/dashboard')
            return
        }   
    }, [authToken, isLoading])

    const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(isLogin){
            try {
                // Login
                await login(formData.email, formData.password);
            } catch (error) {
                console.log("Authentication Error: ", error);
            }
        }
        else{
            try {
                // Register
                await register(formData.name!, formData.email, formData.password, formData.password_confirmation!);
            } catch (error) {
                console.log("Registration Error: ", error);
            }
        }
    }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-6 w-[400px]">
          <h3 className="text-center text-xl font-bold mb-4">{ isLogin ? 'Login' : 'Register' }</h3>
          <form onSubmit={ handleFormSubmit }>
            {
                !isLogin && (
                    <input
                    className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleOnChangeInput}
                    placeholder="Name"
                    required
                    />
                )
            }
            
            <input
              className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleOnChangeInput}
              placeholder="Email"
              required
            />
            <input
              className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleOnChangeInput}
              placeholder="Password"
              required
            />
            {
                !isLogin && (
                    <input
                    className="border border-gray-300 rounded w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleOnChangeInput}
                    placeholder="Confirm Password"
                    required
                    />
                )
            }
            <button
              className="bg-indigo-500 text-white w-full py-2 rounded hover:bg-indigo-600 transition"
              type="submit"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"} <span className="text-indigo-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Register' : 'Login'}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;