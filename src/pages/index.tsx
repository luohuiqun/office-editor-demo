import { OfficePreviewPage } from "@/features/demo";
import styles from "./index.less";

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <OfficePreviewPage
        title="Office Editor"
        defaultFileName="Q3产品发布计划.docx"
        fileType="DOCX"
        newButtonLabel="创建新文档"
      />
    </div>
  );
}
