/** Original decorative botanical drawing, not a representation of available stock. */
export function Botanical({
  className = "",
  variant = "branch",
}: {
  className?: string;
  variant?: "branch" | "fruit";
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M46 250C92 207 115 159 175 113C213 85 249 66 307 32" />
        <path d="M99 191C85 154 55 125 33 128C31 161 55 194 99 191ZM100 190C79 172 60 148 36 131" />
        <path d="M151 132C141 92 156 54 184 43C198 77 185 112 151 132ZM152 128C165 102 176 73 183 46" />
        <path d="M202 96C211 121 245 132 272 116C257 88 234 79 202 96ZM205 97L268 115" />
        <path d="M251 66C240 41 250 20 271 10C283 32 278 51 251 66ZM253 62L270 13" />
        <path d="M184 109C190 127 194 139 194 152M193 145C207 128 224 124 240 132C229 151 209 157 193 145M196 144L236 133" />
        <path d="M194 153C173 137 151 147 140 164C123 191 142 234 168 246C180 252 187 246 195 247C205 245 210 252 222 245C246 230 263 188 246 163C234 146 215 138 194 153Z" />
        <path d="M183 158C193 163 202 163 211 157M154 172C145 188 150 213 159 223M180 237C192 241 206 240 217 235" />
        <path d="M107 181C119 188 126 201 129 214M127 206C112 203 101 209 98 222C113 226 124 220 127 206" />
        {variant === "fruit" && (
          <>
            <path d="M295 161C282 151 266 157 259 170C248 189 263 218 277 225C285 229 290 225 295 226C304 230 313 223 323 206C334 184 329 162 315 157C307 154 302 157 295 161ZM295 160C295 147 300 141 306 136M293 150C283 139 268 139 262 144C268 156 282 157 293 150" />
            <path d="M269 173C264 185 267 198 272 204" />
          </>
        )}
        <path d="M68 235L78 245M78 222L91 233M91 208L103 218" opacity=".45" />
      </g>
    </svg>
  );
}
