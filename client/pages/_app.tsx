import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import store from '~/app';

import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <ToastContainer />
    </Provider>
  );
}

export default appWithTranslation(MyApp);
