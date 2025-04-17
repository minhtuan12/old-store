import React from 'react';
import {Modal} from "antd";
import './styles.scss';
import styles from './styles.module.scss'

export default function ModalDefault(props) {
  const {isModalOpen, handleOk, handleCancel, children, title} = props;
  return(
    <Modal
      className={`general-dialog-wrap`}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={false}
      width={600}
      centered
    >
      <div className={styles.headerWrap}>
        { title }
      </div>
      <div className={styles.mainWrap}>
        {children}
      </div>
    </Modal>
  );
}
