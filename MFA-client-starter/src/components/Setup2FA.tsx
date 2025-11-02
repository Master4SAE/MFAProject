import { Button } from './ui/button';

const Setup2FA = (props: { qrCodeUrl: string; switchForm: () => void }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Scan QR Code to Enable 2FA or I will hunt you!</h2>
      <p className="mb-4">Scan this QR code with your authenticator app (e.g., Google Authenticator).</p>
      <div className="flex justify-center mb-4">
        <img src={props.qrCodeUrl} alt="QR Code" />
      </div>
      <Button onClick={props.switchForm}>Continue</Button>
    </div>
  );
};

export default Setup2FA;
