import type { NextPage, GetServerSideProps } from 'next';
import HomeContainer from '~/containers/HomeContainer';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <HomeContainer />
    </div>
  );
};

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = async ({
  locale = 'en',
}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Home;
