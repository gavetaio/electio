/* eslint-disable react/destructuring-assignment */
// @ts-ignore
import styles from "./ListItem.module.scss";
import Table from "./Table";
import Tags from "./Tags";

const ListItem = ({
  title,
  description,
  table,
  action,
  tags,
  href = "",
}: any) => {
  const content = (
    <div className={styles.container}>
      <div className={styles.info}>
        <h3>{title}</h3>
        <small>{description}</small>
      </div>
      {tags?.length && (
        <div className={styles.tags}>
          <Tags items={tags} />
        </div>
      )}
      {table && (table.length || table.data?.length) && (
        <div className={styles.table}>
          <Table {...table} />
        </div>
      )}
    </div>
  );

  if (action) {
    return (
      <a
        onClick={(event) => {
          event.preventDefault();
          action(href);
        }}
        href={href}
      >
        {content}
      </a>
    );
  }

  return content;
};

export default ListItem;
