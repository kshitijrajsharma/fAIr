import { TTrainingDataset } from "@/types";

export const DatasetCard = ({ dataset }: { dataset: TTrainingDataset }) => {
  return (
    // <Link
    //   disableLinkStyle
    //   nativeAnchor={false}
    //   title={dataset.name}
    //   href={`${APPLICATION_ROUTES.DATASETS}/${dataset.id}`}
    // >
    <div className="w-full h-48 bg-frosted-blue rounded-lg px-6 py-4 flex flex-col justify-between cursor-pointer hover:bg-secondary transition-colors duration-150">
      <div className="flex flex-col gap-y-2 min-h-1/2 w-full">
        <h1 className="text-body-2base md:text-body-1 text-wrap overflow-ellipsis whitespace-nowrap overflow-hidden">
          {dataset.name}
        </h1>
        <p className="bg-primary text-white uppercase w-fit px-1 md:px-3 rounded-md text-body-3">
          ID: {dataset.id}
        </p>
      </div>
      <div>
        <p className="text-gray text-body-4 md:text-body-3">Used by:</p>
        <p className="font-semibold text-body-3 md:text-body-2base">
          {dataset.models_count} Model{dataset.models_count ? "s" : ""}
        </p>
      </div>
    </div>
    // </Link>
  );
};
