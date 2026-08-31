const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

exports.executeCode = async (req, res) => {
  try {
    const { language, code, timeout = 5000 } = req.body;

    if (!language || !code) {
      return res.status(400).json({ error: "Language and code are required" });
    }

    // Only support Python for now
    if (language !== 'python') {
      return res.status(400).json({ error: `Language ${language} is not supported` });
    }

    // Execute Python code with timeout
    try {
      const { stdout, stderr } = await Promise.race([
        execAsync(`python3 -c ${JSON.stringify(code)}`, {
          timeout,
          maxBuffer: 1024 * 1024, // 1MB max output
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        )
      ]);

      res.json({
        output: stdout || '',
        error: stderr || null,
        success: true
      });
    } catch (execError) {
      // Handle execution errors
      if (execError.message === 'Execution timeout') {
        return res.status(408).json({
          error: 'Code execution timed out',
          output: null,
          success: false
        });
      }

      // Python execution errors are usually in stderr
      const errorMessage = execError.stderr || execError.message || 'Unknown execution error';
      
      res.json({
        output: null,
        error: errorMessage,
        success: false
      });
    }
  } catch (error) {
    console.error("Error in executeCode controller:", error);
    res.status(500).json({ 
      error: error.message || "Internal server error",
      output: null,
      success: false
    });
  }
};
