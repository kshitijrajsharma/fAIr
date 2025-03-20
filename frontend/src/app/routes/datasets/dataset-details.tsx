import { PageUnderConstruction } from "@/components/errors";
import { useParams } from "react-router-dom";

export const TrainingDatasetsDetailPage = () => {
  const { id } = useParams();
  console.log(id);
  return <PageUnderConstruction />;
};
