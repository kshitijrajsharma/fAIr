import { OSMLogo, } from "@/assets/images";

import { NavLogo } from "@/components/layout"
import { MadeWithLove } from "@/components/shared";
import { Dialog } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { useDialog } from "@/hooks/use-dialog";
import { useLogin } from "@/hooks/use-login";
import { useLocation, useNavigate } from "react-router-dom";



export const LoginPage = () => {

    const { closeDialog } = useDialog();
    const navigate = useNavigate();
    const { handleLogin } = useLogin();
    const location = useLocation();

    console.log(location.state);

    const handleOnClose = () => {
        closeDialog();
        navigate(-1);
    };

    return (
        <Dialog isOpened={true} closeDialog={handleOnClose} label="">
            <div className=" p-8 flex items-center justify-center flex-col gap-y-16">
                <NavLogo />
                <h1 className="text-body-2base md:text-title-2">Welcome to fAIr</h1>
                <button
                    onClick={handleLogin}
                    className="px-6 py-2 text-white bg-primary rounded-full flex items-center gap-x-2 text-body-3"
                >
                    <Image
                        src={OSMLogo}
                        className="w-6 h-6"
                        alt="Model training in progress"
                    />
                    Sign In/Sign Up with OSM
                </button>
                <MadeWithLove />
            </div>
        </Dialog>
    );
}