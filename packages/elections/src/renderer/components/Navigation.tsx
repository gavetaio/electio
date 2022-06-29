import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.scss';

const links = [
  {
    section: 'PRÆAMBULUS',
    links: [
      {
        to: '/sobre',
        name: 'Sobre este projeto',
      },
    ],
  },
  {
    section: 'INPUT',
    links: [
      {
        to: '/',
        name: 'Dados carregados',
      },
    ],
  },
  {
    section: 'SIMULADOR',
    links: [
      {
        to: '/simulador/legado',
        name: 'Legado',
      },
      {
        to: '/simulador/refatorado',
        name: 'Refatorado',
      },
    ],
  },
  {
    section: 'ANÁLISE DE DADOS',
    links: [
      {
        to: '/urnas-anuladas',
        name: 'Urnas Anuladas',
      },
      {
        to: '/sigilo-quebrado',
        name: 'Sigilo Quebrado',
      },
      {
        to: '/votos-excluidos',
        name: 'Votos Excluídos',
      },
    ],
  },
];

const Navigation = () => {
  const location = useLocation();

  const renderLink = ({ to, name }) => {
    const cls = [];

    if (location.pathname === to) {
      cls.push(styles.active);
    }
    return (
      <Link className={cls.join(' ')} to={to}>
        <h5>{name}</h5>
      </Link>
    );
  };

  return (
    <nav className={styles.container}>
      <header>
        <h2>
          <a target="_blank" href="https://gaveta.io">
            GAVETAIO
          </a>
        </h2>
      </header>
      <div className={styles.wrapper}>
        {links.map((params) => {
          const result = [];
          if (params.section) {
            result.push(<h6>{params.section}</h6>);
            params.links.forEach((link) => {
              result.push(renderLink(link));
            });
          } else {
            // @ts-ignore
            result.push(renderLink(params));
          }
          return <section>{result}</section>;
        })}
      </div>
    </nav>
  );
};

export default Navigation;
