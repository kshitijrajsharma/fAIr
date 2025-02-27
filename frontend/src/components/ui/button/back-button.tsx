import { ArrowBackIcon } from "@/components/ui/icons";
import { useNavigate } from "react-router-dom";

const BackButton = ({
  className,
  route,
}: {
  className?: string;
  route?: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      className={`flex items-center gap-x-2 ${className}`}
      onClick={() => {
        if (route) {
          navigate(route);
        } else {
          navigate(-1);
        }
      }}
      title="Go back"
    >
      <ArrowBackIcon className="icon md:icon-lg" />
      <span className={`text-dark text-body-3`}>Back</span>
    </button>
  );
};

export default BackButton;
