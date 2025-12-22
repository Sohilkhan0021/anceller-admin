import { CircularProgress } from '@mui/material';

const ContentLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px] py-8">
      <CircularProgress color="primary" />
    </div>
  );
};

export { ContentLoader };
