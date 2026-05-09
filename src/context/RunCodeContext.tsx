import axiosInstance from "@/api/pistonApi"
import customMapping from "@/utils/customMapping"
import { Language, RunContext as RunContextType } from "@/types/run"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}

// OneCompiler language map — extension → OneCompiler language id
const oneCompilerLangMap: { [key: string]: string } = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    c: "c",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    kt: "kotlin",
    swift: "swift",
    scala: "scala",
    r: "r",
    dart: "dart",
    lua: "lua",
    sh: "bash",
    bash: "bash",
    cs: "csharp",
}

// Build supported languages from our map
const buildSupportedLanguages = (): Language[] => {
    return Object.entries(oneCompilerLangMap).map(([ext, lang]) => ({
        language: lang,
        version: "",
        aliases: [ext],
    }))
}

const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [supportedLanguages] = useState<Language[]>(buildSupportedLanguages())
    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        language: "",
        version: "",
        aliases: [],
    })

    // Auto-detect language from file extension
    useEffect(() => {
        if (!activeFile?.name) return

        const extension = activeFile.name.split(".").pop()?.toLowerCase()
        if (!extension) return

        // Check custom mapping first
        const customLang = customMapping[extension]
        const langName = customLang || oneCompilerLangMap[extension] || ""

        if (langName) {
            setSelectedLanguage({
                language: langName,
                version: "",
                aliases: [extension],
            })
        } else {
            setSelectedLanguage({ language: "", version: "", aliases: [] })
        }
    }, [activeFile?.name])

    const runCode = async () => {
        try {
            if (!selectedLanguage || !selectedLanguage.language) {
                return toast.error("Please select a language to run the code")
            } else if (!activeFile) {
                return toast.error("Please open a file to run the code")
            }

            toast.loading("Running code...")
            setIsRunning(true)

            console.log("Running with OneCompiler:", {
                language: selectedLanguage.language,
                file: activeFile.name,
            })

            const response = await axiosInstance.post("/run", {
                language: selectedLanguage.language,
                stdin: input,
                files: [{
                    name: activeFile.name,
                    content: activeFile.content,
                }],
            })

            const result = response.data

            if (result.stderr) {
                setOutput(result.stderr)
            } else if (result.exception) {
                setOutput(result.exception)
            } else {
                setOutput(result.stdout || "No output")
            }

            setIsRunning(false)
            toast.dismiss()
        } catch (error: any) {
            console.error("OneCompiler error:",
                error?.response?.data || error?.message || error)
            setIsRunning(false)
            toast.dismiss()
            toast.error("Failed to run the code")
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext