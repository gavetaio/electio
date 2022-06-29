import Font from "./Font";
// @ts-ignore
import styles from "./Badge.module.scss";

const Badge = ({ title = "Badge" }) => (
  <div className={styles.badge}>
    <div>
      <Font type="title" name="badge">
        {title}
      </Font>
    </div>
  </div>
);

export default Badge;
