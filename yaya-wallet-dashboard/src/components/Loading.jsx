import React from "react";
import styles from "./Loader.module.css";

// https://loading.io/css/

export default function Loading() {
  return (
    <div className={styles.loader}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
