import { type NextPage } from "next";
import Head from "next/head";
import { YouTubePlayer } from "~/components/YouTube";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Speaking Practice</title>
        <meta
          name="description"
          content="Practice speaking in a foreign language by using YouTube."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-black">
        <div className="container flex flex-col items-center justify-center gap-12 p-5">
          <YouTubePlayer />
        </div>
      </main>
    </>
  );
};

export default Home;
