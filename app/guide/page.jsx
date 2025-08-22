'use client';
import { useRouter } from 'next/navigation';
import { useTheme, ThemeToggle } from '../../contexts/ThemeContext';

export default function GuidePage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 'clamp(16px, 4vw, 32px)'
    }}>
      {/* 头部导航 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 'clamp(20px, 5vw, 30px)',
        paddingBottom: 'clamp(16px, 4vw, 20px)',
        borderBottom: '1px solid var(--border-primary)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 'clamp(8px, 2vw, 12px)',
          flex: 1
        }}>
          {/* Trama 品牌标题 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <h1 style={{
              fontSize: 'clamp(24px, 6vw, 32px)',
              fontWeight: '700',
              margin: 0,
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              Trama
            </h1>
            <div style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              lineHeight: '1.4'
            }}>
              Notitias in diagrammata teximus ｜ 把信息织成图表
            </div>
          </div>
          
          {/* 使用指南副标题 */}
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 22px)',
            fontWeight: '600',
            margin: 0,
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            📚 使用指南
          </h2>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 12px)'
        }}>
          <a
            href="https://github.com/Retamev/DocToMermaid"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'clamp(32px, 6vw, 40px)',
              height: 'clamp(32px, 6vw, 40px)',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'var(--bg-tertiary)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)';
              e.target.style.transform = 'scale(1)';
            }}
            title="查看GitHub项目"
          >
            <svg
              width="clamp(16px, 4vw, 20px)"
              height="clamp(16px, 4vw, 20px)"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <ThemeToggle size="medium" />
        </div>
        
        <button
          onClick={handleBack}
          style={{
            padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--bg-tertiary)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'var(--bg-secondary)';
          }}
        >
          ← 返回主页
        </button>
      </div>

      {/* 内容区域 */}
      <div className="card" style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'clamp(20px, 5vw, 40px)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* 文档目录 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            🗂️ 文档目录
          </h2>
          <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
             gap: 'clamp(12px, 3vw, 16px)',
             alignItems: 'stretch',
             gridAutoRows: '1fr'
           }}>
            <a href="/guide/buttons" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
               <div
                 className="card"
                 style={{
                   padding: 'clamp(16px, 4vw, 20px)',
                   backgroundColor: 'var(--bg-secondary)',
                   border: '1px solid var(--border-primary)',
                   transition: 'all 0.2s ease',
                   height: '100%',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '8px'
                 }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
               >
                 <h3 style={{
                   fontSize: 'clamp(16px, 3.5vw, 18px)',
                   fontWeight: '600',
                   margin: 0,
                   marginBottom: '8px',
                   color: 'var(--text-primary)',
                   lineHeight: '1.3'
                 }}>
                   🔘 按钮与操作
                 </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(12px, 3vw, 14px)', lineHeight: '1.5', marginTop: '8px' }}>
                  复制代码、导出 PNG/SVG、主题切换、图表类型、处理历史、提交
                </p>
               </div>
             </a>
 
             <a href="/guide/modes" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
               <div
                 className="card"
                 style={{
                   padding: 'clamp(16px, 4vw, 20px)',
                   backgroundColor: 'var(--bg-secondary)',
                   border: '1px solid var(--border-primary)',
                   transition: 'all 0.2s ease',
                   height: '100%',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '8px'
                 }}
                 onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
               >
                 <h3 style={{
                   fontSize: 'clamp(16px, 3.5vw, 18px)',
                   fontWeight: '600',
                   margin: 0,
                   marginBottom: '8px',
                   color: 'var(--text-primary)',
                   lineHeight: '1.3'
                 }}>
                   📥 输入模式
                 </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(12px, 3vw, 14px)', lineHeight: '1.5', marginTop: '8px' }}>
                  PDF上传与图片上传的适用场景、限制与最佳实践
                </p>
               </div>
             </a>
           </div>
         </section>

        {/* 应用简介 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            🎯 应用简介
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Trama 是一个智能工具，能够将 PDF/图片/文本等内容转换为 Mermaid 流程图代码。
            </p>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
              margin: 0,
              paddingLeft: '12px',
              borderLeft: '2px solid var(--border-secondary)'
            }}>
              Notitias in diagrammata teximus ｜ 把信息织成图表
            </p>
          </div>
        </section>

        {/* 主要功能 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            ⚡ 主要功能
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 'clamp(16px, 4vw, 20px)',
            marginBottom: 'clamp(16px, 4vw, 20px)'
          }}>
            <div className="card" style={{
              padding: 'clamp(16px, 4vw, 20px)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              <h3 style={{
                fontSize: 'clamp(16px, 3.5vw, 18px)',
                fontWeight: '600',
                marginBottom: 'clamp(8px, 2vw, 12px)',
                color: 'var(--text-primary)',
                lineHeight: '1.3'
              }}>
                📄 PDF解析
              </h3>
              <ul style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                lineHeight: '1.5',
                color: 'var(--text-secondary)',
                paddingLeft: 'clamp(16px, 4vw, 20px)',
                margin: 0
              }}>
                <li>支持多页PDF文档</li>
                <li>智能文本提取</li>
                <li>多模态图像分析</li>
                <li>大文档Map-Reduce处理</li>
              </ul>
            </div>
            
            <div className="card" style={{
              padding: 'clamp(16px, 4vw, 20px)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              <h3 style={{
                fontSize: 'clamp(16px, 3.5vw, 18px)',
                fontWeight: '600',
                marginBottom: 'clamp(8px, 2vw, 12px)',
                color: 'var(--text-primary)',
                lineHeight: '1.3'
              }}>
                🎨 图表渲染
              </h3>
              <ul style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                lineHeight: '1.5',
                color: 'var(--text-secondary)',
                paddingLeft: 'clamp(16px, 4vw, 20px)',
                margin: 0
              }}>
                <li>基于官方Mermaid.js库</li>
                <li>支持多种图表方向</li>
                <li>自动主题适配</li>
                <li>实时渲染预览</li>
              </ul>
            </div>
            
            <div className="card" style={{
              padding: 'clamp(16px, 4vw, 20px)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}>
              <h3 style={{
                fontSize: 'clamp(16px, 3.5vw, 18px)',
                fontWeight: '600',
                marginBottom: 'clamp(8px, 2vw, 12px)',
                color: 'var(--text-primary)',
                lineHeight: '1.3'
              }}>
                💾 导出功能
              </h3>
              <ul style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                lineHeight: '1.5',
                color: 'var(--text-secondary)',
                paddingLeft: 'clamp(16px, 4vw, 20px)',
                margin: 0
              }}>
                <li>4K高质量PNG导出</li>
                <li>矢量SVG格式</li>
                <li>代码复制功能</li>
                <li>自适应图表尺寸</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 使用步骤 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            📋 使用步骤
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 3vw, 16px)'
          }}>
            {[
              { step: '1', title: '上传PDF文件', desc: '选择需要转换的PDF文档，支持多页文档' },
              { step: '2', title: '配置选项', desc: '选择图表类型、方向，启用多模态解析等选项' },
              { step: '3', title: '生成图表', desc: '点击生成按钮，系统自动解析PDF并生成Mermaid代码' },
              { step: '4', title: '预览和编辑', desc: '查看生成的图表，可以重新渲染或调整' },
              { step: '5', title: '导出结果', desc: '导出PNG图片、SVG文件或复制Mermaid代码' }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 3vw, 16px)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{
                  width: 'clamp(28px, 6vw, 32px)',
                  height: 'clamp(28px, 6vw, 32px)',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h4 style={{
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: '600',
                    marginBottom: 'clamp(2px, 1vw, 4px)',
                    color: 'var(--text-primary)',
                    lineHeight: '1.3'
                  }}>
                    {item.title}
                  </h4>
                  <p style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 技术特性 */}
        <section style={{ marginBottom: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            🚀 技术特性
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: 'clamp(12px, 3vw, 16px)'
          }}>
            {[
              { icon: '⚡', title: '高性能渲染', desc: '基于官方Mermaid.js，预加载优化' },
              { icon: '🎨', title: '主题适配', desc: '自动明暗模式切换，美观界面' },
              { icon: '🔧', title: '智能解析', desc: 'AI驱动的PDF内容理解和转换' },
              { icon: '📱', title: '响应式设计', desc: '支持各种屏幕尺寸和设备' },
              { icon: '🛡️', title: '稳定可靠', desc: '完善的错误处理和状态管理' },
              { icon: '🔄', title: '实时预览', desc: '即时渲染，所见即所得' }
            ].map((item, index) => (
              <div key={index} style={{
                padding: 'clamp(12px, 3vw, 16px)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  marginBottom: 'clamp(6px, 2vw, 8px)'
                }}>
                  {item.icon}
                </div>
                <h4 style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: '600',
                  marginBottom: 'clamp(2px, 1vw, 4px)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.3'
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 常见问题 */}
        <section>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            ❓ 常见问题
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            {[
              {
                q: '支持哪些PDF格式？',
                a: '支持标准PDF文档，包括文本和图像内容。建议使用清晰、结构化的PDF文件以获得最佳效果。'
              },
              {
                q: '生成的图表可以编辑吗？',
                a: '生成的是标准Mermaid代码，可以复制后在任何支持Mermaid的编辑器中进一步编辑和定制。'
              },
              {
                q: '导出的图片质量如何？',
                a: '支持4K高质量PNG导出和矢量SVG格式，确保在各种用途下都有优秀的显示效果。'
              },
              {
                q: '处理大文件需要多长时间？',
                a: '处理时间取决于文档大小和复杂度。系统会显示实时进度，大文档会自动使用Map-Reduce优化处理。'
              }
            ].map((item, index) => (
              <details key={index} style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                padding: 'clamp(12px, 3vw, 16px)'
              }}>
                <summary style={{
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  marginBottom: 'clamp(6px, 2vw, 8px)',
                  lineHeight: '1.3'
                }}>
                  {item.q}
                </summary>
                <p style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                  paddingLeft: 'clamp(12px, 3vw, 16px)'
                }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 联系开发者 */}
        <section style={{ marginTop: 'clamp(24px, 6vw, 40px)' }}>
          <h2 style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--accent-primary)',
            lineHeight: '1.3'
          }}>
            📞 联系开发者
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 3vw, 16px)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            padding: 'clamp(20px, 5vw, 24px)'
          }}>
            <p style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              color: 'var(--text-secondary)',
              margin: 0,
              marginBottom: 'clamp(12px, 3vw, 16px)',
              lineHeight: '1.5'
            }}>
              如果您在使用过程中遇到问题，或有任何建议和反馈，欢迎通过以下方式联系我：
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 3vw, 16px)'
            }}>
              {/* 邮箱联系 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 3vw, 16px)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(36px, 8vw, 48px)',
                  height: 'clamp(36px, 8vw, 48px)',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <svg
                     width="clamp(18px, 4vw, 24px)"
                     height="clamp(18px, 4vw, 24px)"
                     viewBox="0 0 24 24"
                     fill="currentColor"
                   >
                     <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                   </svg>
                </div>
                <div>
                  <h4 style={{
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: '600',
                    marginBottom: 'clamp(2px, 1vw, 4px)',
                    color: 'var(--text-primary)',
                    lineHeight: '1.3'
                  }}>
                    邮箱联系
                  </h4>
                  <a
                    href="mailto:reta@cumt.edu.cn"
                    style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: 'var(--accent-primary)',
                      textDecoration: 'none',
                      lineHeight: '1.4',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.textDecoration = 'none';
                    }}
                  >
                    reta@cumt.edu.cn
                  </a>
                </div>
              </div>

              {/* 微信联系 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 3vw, 16px)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(36px, 8vw, 48px)',
                  height: 'clamp(36px, 8vw, 48px)',
                  borderRadius: '50%',
                  backgroundColor: '#07C160',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <svg
                       width="clamp(18px, 4vw, 24px)"
                       height="clamp(18px, 4vw, 24px)"
                       viewBox="0 0 24 24"
                       fill="currentColor"
                     >
                       <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                     </svg>
                </div>
                <div>
                  <h4 style={{
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: '600',
                    marginBottom: 'clamp(2px, 1vw, 4px)',
                    color: 'var(--text-primary)',
                    lineHeight: '1.3'
                  }}>
                    微信联系
                  </h4>
                  <p style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    微信号：Soph0cless
                  </p>
                </div>
              </div>
            </div>
           </div>
        </section>
      </div>
    </div>
  );
}