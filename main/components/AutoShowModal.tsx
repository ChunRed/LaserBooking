// components/AutoShowModal.tsx
import { useEffect } from 'react'

export default function AutoShowModal() {
    useEffect(() => {
        let instance: any
            ; (async () => {
                const Modal = (await import('bootstrap/js/dist/modal')).default
                const el = document.getElementById('myModal')
                if (el) {
                    instance = new Modal(el)
                    instance.show()
                }
            })()
        return () => { try { instance?.hide?.() } catch { } }
    }, [])

    return (
        <div className="modal fade" id="myModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">預約須知</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="row mt-1 lu-font justify-content-center">
                            <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
                                <li>請提前一天預約</li>
                                <li>雷切機使用時間為晚上 19:00-21:00</li>
                                <li>請自備隨身碟</li>
                                <li>預約者須繳納押金</li>
                                <li>結束請帶走個人物品＆協助清潔工具設備</li>
                                <li>雷切機管理員將協助您操作設備</li>
                                <li>預約未到者將扣押金 50 $</li>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


