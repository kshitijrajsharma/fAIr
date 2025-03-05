import { AddIcon } from "@/components/ui/icons";
import { ButtonWithIcon } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchFilter } from "@/components/shared";
import { TQueryParams } from "@/types";

export const ProfileSectionHeader = ({
  title,
  createRoute,
  createButtonAlt,
  query,
  updateQuery,
  showSearchBar,
}: {
  title: string;
  createRoute?: string;
  createButtonAlt?: string;
  query?: TQueryParams;
  updateQuery?: (params: TQueryParams) => void;
  showSearchBar?: boolean;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(createRoute as string);
  };
  return (
    <div className="flex justify-between items-center">
      <h1 className="font-bold text-title-2 self-start">{title}</h1>
      {createRoute && createButtonAlt && (
        <ButtonWithIcon
          onClick={handleClick}
          variant="primary"
          prefixIcon={AddIcon}
          label={createButtonAlt}
        />
      )}
      {showSearchBar && updateQuery && query && (
        <SearchFilter
          query={query}
          updateQuery={updateQuery}
          placeholder="Search datasets..."
        />
      )}
    </div>
  );
};
