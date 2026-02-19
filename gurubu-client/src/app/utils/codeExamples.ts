// Hello World examples for supported programming languages
export const getHelloWorldExample = (language: string): string => {
  const examples: Record<string, string> = {
    javascript: 'console.log("Hello, World!");',
    typescript: 'console.log("Hello, World!");',
    python: 'print("Hello, World!")',
    html: `<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        h1 {
            color: white;
            font-size: 3em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
  };

  return examples[language] || examples.javascript;
};
