import { DatasetCard } from "./dataset-card";
import { DatasetListSkeleton } from "./dataset-list-skeleton";
import { Button } from "@/components/ui/button";
import { NoTrainingAreaIcon } from "@/components/ui/icons";
import { TTrainingDataset } from "@/types";

export const DatasetList = ({
  datasets,
  isPending,
  isError,
  refetch,
}: {
  datasets: TTrainingDataset[];
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}) => {
  /**
   * Pending state.
   */
  if (isPending) {
    return <DatasetListSkeleton />;
  }

  /**
   * Error state.
   */
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-y-10">
        Error loading datasets.
        <Button className="!w-fit" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  /**
   * Empty state.
   */

  if (datasets.length == 0) {
    return (
      <div className="flex flex-col  gap-y-10 items-center justify-center">
        <NoTrainingAreaIcon />
        <p>No training dataset found.</p>
      </div>
    );
  }

  /**
   * Dataset list
   */
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(299px,1fr))] gap-8">
      {datasets.map((dataset) => (
        <DatasetCard key={dataset.id} dataset={dataset} />
      ))}
    </div>
  );
};
