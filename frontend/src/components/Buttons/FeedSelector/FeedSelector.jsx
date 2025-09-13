import React from 'react'
import styles from "./FeedSelector.module.css";

export default function FeedSelector () {
  return (
    <div className={styles.flex}>
      <div className={styles.box}>For You</div>
      <div className={styles.box}>Popular</div>
      <div className={styles.box}>Following</div>
    </div>
  )
}