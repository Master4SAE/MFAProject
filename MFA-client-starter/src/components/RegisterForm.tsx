import { Button } from '@/components/ui/button';
import { CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useForm } from '@/hooks/formHooks';
import Setup2FA from './Setup2FA';
import { useUser } from '@/hooks/apiHooks';

const RegisterForm = (props: { switchForm: () => void }) => {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(true);
  const [emailAvailable, setEmailAvailable] = useState<boolean>(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { getUsernameAvailable, getEmailAvailable, postUser } = useUser();

  const initValues = { username: '', password: '', email: '' };

  // Define the doRegister function to handle user registration and 2FA setup
  const doRegister = async () => {
    try {
      // Step 1: Check if username and email are available
      const usernameCheck = await getUsernameAvailable(inputs.username);
      setUsernameAvailable(usernameCheck.available);
      const emailCheck = await getEmailAvailable(inputs.email);
      setEmailAvailable(emailCheck.available);

      if (usernameCheck.available && emailCheck.available) {
        // Step 2: Call postUser function to register the user and set up 2FA
        const registerResponse = await postUser(inputs);
        setQrCodeUrl(registerResponse.qrCodeUrl);
      }
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const { handleSubmit, handleInputChange, inputs } = useForm(
    doRegister,
    initValues,
  );

  const handleUsernameBlur = async (
    event: React.SyntheticEvent<HTMLInputElement>,
  ) => {
    const result = await getUsernameAvailable(event.currentTarget.value);
    setUsernameAvailable(result.available);
  };

  const handleEmailBlur = async () => {
    const result = await getEmailAvailable(inputs.email);
    setEmailAvailable(result.available);
  };

  return (
    <>
      {qrCodeUrl ? (
        <Setup2FA qrCodeUrl={qrCodeUrl} switchForm={props.switchForm} />
      ) : (
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold">Register</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-6 py-8">
            <div className="space-y-2">
              <Label htmlFor="username">Full Name</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                required
                onChange={handleInputChange}
                onBlur={handleUsernameBlur}
              />
              {!usernameAvailable && (
                <p className="text-red-500">Username not available</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
              />
              {!emailAvailable && (
                <p className="text-red-500">Email not available</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                onChange={handleInputChange}
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6">
            <div className="w-full flex justify-center">
              <Button>Register</Button>
            </div>
          </CardFooter>
        </form>
      )}
    </>
  );
};

export default RegisterForm;
