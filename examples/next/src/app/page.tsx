import Link from "next/link";
import styles from "../styles/Home.module.css";

export default async function RootPage() {


    return <div className={styles.container}>


        <main className={styles.main}>
            <h1 className={styles.title}>
                <div>GraphQL Library Template</div>

            </h1>

        </main>

        <footer className={styles.footer}>
            <Link href="https://github.com/graphql-api/graphql-local-cron">Github</Link>
        </footer>
    </div>
}