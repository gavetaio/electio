// @ts-ignore
import styles from "./Empty.module.scss";
import Button from "./Button";
import { DesktopDownloadIcon } from "@primer/octicons-react";

const Empty = ({
  message = "Para visualizar esta página, carregue os dados de pelo menos um ciclo eleitoral com problemas.",
  action = null,
  label = "Carregar Dados",
  Icon = DesktopDownloadIcon,
}) => {
  return (
    <div className={styles.container}>
      {Icon && <Icon size={32} />}
      <h5>{message}</h5>
      {action && (
        <footer>
          <Button onClick={action}>{label}</Button>
        </footer>
      )}
    </div>
  );
};

export default Empty;
