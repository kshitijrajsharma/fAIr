import { Link } from "@/components/ui/link";
import { APPLICATION_ROUTES } from "@/constants";
import { TTrainingDataset } from "@/types";

export const DatasetCard = ({ dataset }: { dataset: TTrainingDataset }) => {
  return (
    <Link
      disableLinkStyle
      nativeAnchor={false}
      title={dataset.name}
      href={`${APPLICATION_ROUTES.DATASETS}/${dataset.id}`}
    >
      <div className="w-full h-48 bg-frosted-blue rounded-lg px-6 py-4 flex flex-col justify-between cursor-pointer hover:bg-secondary transition-colors duration-150">
        <div className="flex flex-col gap-y-2 h-1/2">
          <h1 className="text-wrap overflow-ellipsis whitespace-nowrap overflow-hidden">
            {dataset.name}
          </h1>
          <p className="bg-primary text-white uppercase w-fit px-3 rounded-md">
            ID: {dataset.id}
          </p>
        </div>
        <div>
          <p>Used by:</p>
          <p className="font-semibold">8 Models</p>
        </div>
      </div>
    </Link>
  );
};
