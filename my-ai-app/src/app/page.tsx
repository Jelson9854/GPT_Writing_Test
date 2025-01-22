import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Essay Writing Prompts</h1>
      <ul>
        <li>
          <Link href="/prompt1">Go to Prompt 1</Link>
        </li>
        <li>
          <Link href="/prompt2">Go to Prompt 2</Link>
        </li>
      </ul>
    </div>
  );
}
