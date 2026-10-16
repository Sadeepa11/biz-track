export default function SplashScreen() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-white flex flex-col items-center justify-center z-50 select-none">
      <div className="flex flex-col items-center animate-pulse">
        <img
          src="/BizTrackGrowthLogoVertical.png"
          alt="Biz Track"
          className="w-48 sm:w-56 h-auto object-contain"
        />
      </div>
    </div>
  );
}
