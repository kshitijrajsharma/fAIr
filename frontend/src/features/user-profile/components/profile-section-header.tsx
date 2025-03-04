import { AddIcon } from "@/components/ui/icons";
import { ButtonWithIcon } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ProfileSectionHeader = ({
  title,
  createRoute,
  createButtonAlt,
}: {
  title: string;
  createRoute: string;
  createButtonAlt: string;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(createRoute);
  };
  return (
    <div className="flex justify-between items-center">
      <h1 className="font-bold text-title-2 self-start">{title}</h1>
      <ButtonWithIcon
        onClick={handleClick}
        variant="primary"
        prefixIcon={AddIcon}
        label={createButtonAlt}
      />
    </div>
  );
};
