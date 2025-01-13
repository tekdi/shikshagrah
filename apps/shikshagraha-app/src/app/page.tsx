export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */

  const NEXT_PUBLIC_ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

  return (
    <div>
      <h1>
        <span> Hello there, </span>
        Welcome shikshagraha-app 👋 Add Login here
        {NEXT_PUBLIC_ENVIRONMENT}
      </h1>
    </div>
  );
}
