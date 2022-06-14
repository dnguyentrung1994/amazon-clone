import styles from './Home.module.css';
import React, { FC } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

const HomeContainer: FC = () => {
  const { t } = useTranslation('common');
  return <div className={clsx(styles.title)}>{t('hello')}</div>;
};

export default HomeContainer;
