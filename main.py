import sys
import os
import json
import requests
from PySide6.QtCore import Qt, QUrl, QTimer, QSize, QPoint, QPointF, QPropertyAnimation, QEasingCurve, QRect, QMimeData
from PySide6.QtGui import QIcon, QFont, QPixmap, QDragEnterEvent, QDropEvent, QPainter, QPen, QColor, QKeyEvent, QDrag
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, QListWidget,
    QListWidgetItem, QStackedWidget, QTextEdit, QLineEdit, QPushButton, QLabel,
    QComboBox, QFileDialog, QTabWidget, QSlider, QProgressBar, QStatusBar,
    QGroupBox, QFormLayout, QCheckBox, QSpinBox, QMessageBox, QScrollArea,
    QGridLayout, QSplitter, QDockWidget, QDoubleSpinBox, QFrame, QGraphicsOpacityEffect,
    QListWidgetItem, QTreeWidget, QTreeWidgetItem
)
from PySide6.QtMultimedia import QMediaPlayer, QAudioOutput
from PySide6.QtMultimediaWidgets import QVideoWidget

# ===================== Global Stylesheet (Professional Dark Theme) =====================
STYLE_SHEET = """
QMainWindow, QWidget { background-color: #11111b; color: #cdd6f4; font-family: "Segoe UI", "Microsoft YaHei"; font-size: 13px; }
QListWidget { background-color: #181825; border: none; padding: 10px 0; }
QListWidget::item { padding: 14px 20px; margin: 4px 8px; border-radius: 8px; color: #bac2de; }
QListWidget::item:hover { background-color: #313244; }
QListWidget::item:selected { background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #89b4fa, stop:1 #cba6f7); color: #11111b; font-weight: bold; }
QPushButton { 
    background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #89b4fa, stop:1 #74c7ec); 
    color: #11111b; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold;
}
QPushButton:hover { background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #b4befe, stop:1 #89b4fa); }
QPushButton:pressed { background: #74c7ec; padding: 9px 15px 7px 17px; }
QPushButton:disabled { background: #313244; color: #6c7086; }
QPushButton[secondary="true"] { background: #313244; color: #cdd6f4; }
QPushButton[secondary="true"]:hover { background: #45475a; }
QPushButton[secondary="true"]:pressed { background: #1e1e2e; }
QLineEdit, QTextEdit, QComboBox, QSpinBox, QDoubleSpinBox { 
    background-color: #1e1e2e; border: 1px solid #313244; border-radius: 6px; padding: 6px; color: #cdd6f4;
}
QTextEdit:focus, QLineEdit:focus, QComboBox:focus { border: 1px solid #89b4fa; }
QTabWidget::pane { border: 1px solid #313244; border-radius: 8px; background-color: #11111b; top: -1px; }
QTabBar::tab { 
    background-color: #181825; color: #bac2de; padding: 10px 18px; 
    border-top-left-radius: 6px; border-top-right-radius: 6px; margin-right: 2px; border: 1px solid transparent;
}
QTabBar::tab:selected { 
    background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #89b4fa20, stop:1 #89b4fa00); 
    color: #89b4fa; font-weight: bold; border: 1px solid #89b4fa40; border-bottom: none;
}
QProgressBar { background-color: #1e1e2e; border-radius: 4px; text-align: center; border: 1px solid #313244; }
QProgressBar::chunk { background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #a6e3a1, stop:1 #94e2d5); border-radius: 4px; }
QGroupBox { border: 1px solid #313244; border-radius: 8px; margin-top: 12px; padding-top: 12px; }
QGroupBox::title { subcontrol-origin: margin; left: 12px; padding: 0 6px; color: #89b4fa; font-weight: bold; }
QStatusBar { background-color: #181825; color: #bac2de; border-top: 1px solid #313244; }
QScrollArea { border: none; background-color: transparent; }
QScrollBar:vertical { background: #181825; width: 8px; border-radius: 4px; }
QScrollBar::handle:vertical { background: #45475a; border-radius: 4px; }
QScrollBar::handle:vertical:hover { background: #585b70; }
QSlider::groove:horizontal { height: 6px; background: #1e1e2e; border-radius: 3px; border: 1px solid #313244; }
QSlider::handle:horizontal { width: 16px; height: 16px; margin: -6px 0; border-radius: 8px; background: #89b4fa; }
QSlider::handle:horizontal:hover { background: #b4befe; }
QFrame[slidingPanel="true"] {
    background-color: #181825;
    border-top: 1px solid #313244;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
}
QFrame[popup="true"] {
    background-color: #1e1e2e;
    border: 1px solid #89b4fa60;
    border-radius: 12px;
}
QFrame[timelineClip="true"] {
    background-color: #89b4fa60;
    border: 1px solid #89b4fa;
    border-radius: 3px;
}
QFrame[mediaLibraryItem="true"]:hover {
    background-color: #313244;
}
"""

# ===================== Sliding Bottom Panel =====================
class SlidingBottomPanel(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setProperty("slidingPanel", "true")
        self.is_open = False
        self.panel_height = 350
        self.init_ui()
        self.init_animation()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 16, 20, 20)
        layout.setSpacing(12)

        drag_bar = QHBoxLayout()
        drag_bar.addStretch()
        drag_handle = QLabel()
        drag_handle.setFixedSize(60, 6)
        drag_handle.setStyleSheet("background-color: #45475a; border-radius: 3px;")
        drag_bar.addWidget(drag_handle)
        drag_bar.addStretch()
        layout.addLayout(drag_bar)

        layout.addWidget(QLabel("⚡ Quick Actions", font=QFont("Segoe UI", 12, QFont.Bold)))
        
        btn_grid = QGridLayout()
        quick_actions = [
            ("📸 Quick Screenshot", "screenshot"),
            ("🎤 Voice Input", "voice"),
            ("📋 Paste Clipboard", "paste"),
            ("💾 Save Project", "save"),
            ("🖼️ Batch Image Gen", "batch_img"),
            ("🎬 Batch Video Gen", "batch_video")
        ]
        for i, (name, action) in enumerate(quick_actions):
            btn = QPushButton(name)
            btn.setProperty("secondary", "true")
            btn.setFixedHeight(40)
            btn_grid.addWidget(btn, i//3, i%3)
        layout.addLayout(btn_grid)

        layout.addWidget(QLabel("📁 Recent Files"))
        self.recent_list = QListWidget()
        self.recent_list.setFixedHeight(100)
        for i in range(3):
            self.recent_list.addItem(f"Project_{i+1}.seedproj  |  Last edited 2024-05-{20-i}")
        layout.addWidget(self.recent_list)

        self.move(0, self.parent().height() if self.parent() else 800)
        self.resize(self.parent().width() if self.parent() else 1200, self.panel_height)

    def init_animation(self):
        self.animation = QPropertyAnimation(self, b"geometry")
        self.animation.setDuration(300)
        self.animation.setEasingCurve(QEasingCurve.OutCubic)

    def toggle(self):
        if not self.parent():
            return
        window_height = self.parent().height()
        window_width = self.parent().width()
        
        if self.is_open:
            self.animation.setStartValue(QRect(0, window_height - self.panel_height, window_width, self.panel_height))
            self.animation.setEndValue(QRect(0, window_height, window_width, self.panel_height))
            self.is_open = False
        else:
            target_y = window_height // 2
            self.animation.setStartValue(QRect(0, window_height, window_width, self.panel_height))
            self.animation.setEndValue(QRect(0, target_y, window_width, self.panel_height))
            self.is_open = True
        self.animation.start()

# ===================== E-key Quick Access Popup =====================
class QuickPopup(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setProperty("popup", "true")
        self.is_visible = False
        self.setFixedSize(320, 220)
        self.init_ui()
        self.hide()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(10)

        layout.addWidget(QLabel("⚡ Quick Access (Press E to toggle)", font=QFont("Segoe UI", 11, QFont.Bold)))
        layout.addWidget(QLabel("Jump to:"))

        shortcuts = [
            ("1 - Dola Seed Chat", 0),
            ("2 - Seedream 5.0", 1),
            ("3 - Video Editor", 2),
            ("4 - Code Editor", 3),
            ("5 - Projects", 4),
            ("6 - Settings", 5)
        ]
        for name, index in shortcuts:
            btn = QPushButton(name)
            btn.setProperty("secondary", "true")
            btn.setStyleSheet("text-align: left; padding: 6px 12px;")
            layout.addWidget(btn)

    def toggle(self, window_geometry):
        if self.is_visible:
            self.hide()
            self.is_visible = False
        else:
            self.move(window_geometry.width() - self.width() - 20, 20)
            self.show()
            self.is_visible = True

# ===================== Motion Control Canvas =====================
class MotionCanvas(QLabel):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setStyleSheet("background-color: #181825; border-radius: 8px; border: 1px solid #313244;")
        self.setAlignment(Qt.AlignCenter)
        self.keyframes = []
        self.current_ref_pixmap = None
        self.tracking_enabled = False

    def set_reference_image(self, pixmap):
        self.current_ref_pixmap = pixmap.scaled(self.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation)
        self.setPixmap(self.current_ref_pixmap)
        self.keyframes = []
        self.update()

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton and self.current_ref_pixmap:
            self.keyframes.append(event.position())
            self.update()

    def paintEvent(self, event):
        super().paintEvent(event)
        if not self.current_ref_pixmap or len(self.keyframes) == 0:
            return
        
        painter = QPainter(self)
        pen = QPen(QColor("#89b4fa"), 2, Qt.DashLine)
        painter.setPen(pen)
        
        if len(self.keyframes) > 1:
            for i in range(len(self.keyframes)-1):
                painter.drawLine(self.keyframes[i], self.keyframes[i+1])
        
        pen.setStyle(Qt.SolidLine)
        pen.setColor(QColor("#f9e2af"))
        pen.setWidth(6)
        painter.setPen(pen)
        for i, point in enumerate(self.keyframes):
            painter.drawEllipse(point, 4, 4)
            painter.drawText(point + QPointF(8, -8), f"K{i+1}")
        
        painter.end()

    def clear_keyframes(self):
        self.keyframes = []
        self.update()

# ===================== Seedream 5.0 Page =====================
class SeedreamPage(QWidget):
    def __init__(self, send_to_video_callback):
        super().__init__()
        self.send_to_video_callback = send_to_video_callback
        self.generated_images = []
        self.init_ui()

    def init_ui(self):
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        left_panel = QWidget()
        left_panel.setFixedWidth(320)
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(16, 16, 16, 16)
        left_layout.setSpacing(12)

        top_bar = QHBoxLayout()
        top_bar.addWidget(QLabel("🖼️ Seedream 5.0", font=QFont("Segoe UI", 14, QFont.Bold)))
        top_bar.addStretch()
        self.model_selector = QComboBox()
        self.model_selector.addItems(["Pro", "Lite", "Pro Max"])
        top_bar.addWidget(self.model_selector)
        left_layout.addLayout(top_bar)

        self.tabs = QTabWidget()
        self.tabs.addTab(self.create_text_to_img_tab(), "✨ Text to Image")
        self.tabs.addTab(self.create_img_to_img_tab(), "🖼️ Image to Image")
        self.tabs.addTab(self.create_inpaint_tab(), "🎨 Inpaint")
        left_layout.addWidget(self.tabs)

        param_group = QGroupBox("Generation Parameters")
        param_layout = QFormLayout(param_group)
        
        self.resolution_selector = QComboBox()
        self.resolution_selector.addItems(["1024×1024", "1920×1080", "1280×720", "4K (3840×2160)", "768×1024"])
        param_layout.addRow("Resolution:", self.resolution_selector)
        
        self.steps_slider = QSpinBox()
        self.steps_slider.setRange(10, 50)
        self.steps_slider.setValue(30)
        param_layout.addRow("Steps:", self.steps_slider)
        
        self.cfg_slider = QDoubleSpinBox()
        self.cfg_slider.setRange(1, 15)
        self.cfg_slider.setValue(7)
        self.cfg_slider.setSingleStep(0.5)
        param_layout.addRow("CFG Scale:", self.cfg_slider)

        left_layout.addWidget(param_group)

        advanced_group = QGroupBox("Seedream 5.0 Exclusive Features")
        advanced_layout = QVBoxLayout(advanced_group)
        
        self.web_search_check = QCheckBox("🌐 Real-time web search")
        advanced_layout.addWidget(self.web_search_check)
        
        self.deep_think_check = QCheckBox("🧠 Deep reasoning mode")
        advanced_layout.addWidget(self.deep_think_check)
        
        self.text_render_check = QCheckBox("🔤 Enhanced text rendering")
        self.text_render_check.setChecked(True)
        advanced_layout.addWidget(self.text_render_check)
        
        self.consistency_check = QCheckBox("👤 Character consistency")
        advanced_layout.addWidget(self.consistency_check)
        
        self.multilingual_check = QCheckBox("🌍 Multilingual support")
        self.multilingual_check.setChecked(True)
        advanced_layout.addWidget(self.multilingual_check)

        left_layout.addWidget(advanced_group)

        style_group = QGroupBox("Style Presets")
        style_layout = QGridLayout(style_group)
        styles = ["Realistic", "Neon Retro", "Cyberpunk", "Anime", "Film", "Ink", "3D Render", "Minimal"]
        for i, style in enumerate(styles):
            btn = QPushButton(style)
            btn.setProperty("secondary", "true")
            btn.clicked.connect(lambda checked, s=style: self.prompt_input.append(f", {s} style"))
            style_layout.addWidget(btn, i//2, i%2)
        left_layout.addWidget(style_group)

        left_layout.addStretch()
        self.generate_btn = QPushButton("🚀 Generate Image")
        self.generate_btn.setFixedHeight(44)
        self.generate_btn.clicked.connect(self.generate_image)
        left_layout.addWidget(self.generate_btn)

        self.gen_progress = QProgressBar()
        self.gen_progress.setVisible(False)
        left_layout.addWidget(self.gen_progress)

        main_layout.addWidget(left_panel)

        center_panel = QWidget()
        center_layout = QVBoxLayout(center_panel)
        center_layout.setContentsMargins(16, 16, 16, 16)
        center_layout.setSpacing(12)

        self.preview_label = QLabel("Generated image will appear here")
        self.preview_label.setAlignment(Qt.AlignCenter)
        self.preview_label.setStyleSheet("background-color: #181825; border-radius: 8px; border: 1px solid #313244;")
        self.preview_label.setMinimumSize(600, 600)
        center_layout.addWidget(self.preview_label, stretch=1)

        action_bar = QHBoxLayout()
        self.download_btn = QPushButton("💾 Download")
        self.download_btn.setProperty("secondary", "true")
        self.download_btn.clicked.connect(self.download_image)
        self.download_btn.setDisabled(True)
        action_bar.addWidget(self.download_btn)

        self.send_to_video_btn = QPushButton("🎬 Send to Motion Video")
        self.send_to_video_btn.clicked.connect(self.send_to_video)
        self.send_to_video_btn.setDisabled(True)
        action_bar.addWidget(self.send_to_video_btn)

        self.copy_prompt_btn = QPushButton("📋 Copy Prompt")
        self.copy_prompt_btn.setProperty("secondary", "true")
        self.copy_prompt_btn.clicked.connect(lambda: QApplication.clipboard().setText(self.prompt_input.toPlainText()))
        action_bar.addWidget(self.copy_prompt_btn)

        center_layout.addLayout(action_bar)
        main_layout.addWidget(center_panel, stretch=1)

        right_panel = QWidget()
        right_panel.setFixedWidth(240)
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(16, 16, 16, 16)
        right_layout.addWidget(QLabel("📚 History", font=QFont("Segoe UI", 12, QFont.Bold)))

        self.gallery = QListWidget()
        self.gallery.setViewMode(QListWidget.IconMode)
        self.gallery.setIconSize(QSize(200, 200))
        self.gallery.setResizeMode(QListWidget.Adjust)
        self.gallery.setSpacing(12)
        self.gallery.itemClicked.connect(self.load_history_image)
        right_layout.addWidget(self.gallery, stretch=1)

        main_layout.addWidget(right_panel)

    def create_text_to_img_tab(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(0, 0, 0, 0)
        
        layout.addWidget(QLabel("Prompt:"))
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Describe the image you want, the more detail the better")
        self.prompt_input.setFixedHeight(120)
        layout.addWidget(self.prompt_input)

        layout.addWidget(QLabel("Negative Prompt (optional):"))
        self.negative_prompt = QLineEdit()
        self.negative_prompt.setPlaceholderText("What you don't want: blurry, low quality, distorted")
        layout.addWidget(self.negative_prompt)

        layout.addWidget(QLabel("💡 Quick Templates:"))
        template_layout = QGridLayout()
        templates = [
            ("Product Shot", "Professional product photography, soft lighting, white background, 8K"),
            ("Portrait", "Realistic portrait, soft light, cinematic color grading, skin texture"),
            ("Poster", "Creative poster, typography, high contrast, visual impact"),
            ("Scene", "Epic landscape, wide angle, lighting layers, rich detail")
        ]
        for i, (name, prompt) in enumerate(templates):
            btn = QPushButton(name)
            btn.setProperty("secondary", "true")
            btn.clicked.connect(lambda checked, p=prompt: self.prompt_input.setPlainText(p))
            template_layout.addWidget(btn, i//2, i%2)
        layout.addLayout(template_layout)

        return page

    def create_img_to_img_tab(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.ref_img_label = QLabel("Drag or click to upload reference image")
        self.ref_img_label.setFixedHeight(150)
        self.ref_img_label.setAlignment(Qt.AlignCenter)
        self.ref_img_label.setStyleSheet("border: 2px dashed #45475a; border-radius: 8px; color: #6c7086;")
        self.ref_img_label.setAcceptDrops(True)
        self.ref_img_label.dragEnterEvent = lambda e: e.acceptProposedAction() if e.mimeData().hasUrls() else None
        self.ref_img_label.dropEvent = self.drop_ref_image
        self.ref_img_label.mousePressEvent = lambda e: self.upload_ref_image()
        layout.addWidget(self.ref_img_label)

        layout.addWidget(QLabel("Prompt (describe changes):"))
        self.img2img_prompt = QTextEdit()
        self.img2img_prompt.setPlaceholderText("Describe what you want to change about the reference image")
        self.img2img_prompt.setFixedHeight(80)
        layout.addWidget(self.img2img_prompt)

        layout.addWidget(QLabel("Similarity:"))
        self.similarity_slider = QSlider(Qt.Horizontal)
        self.similarity_slider.setRange(0, 100)
        self.similarity_slider.setValue(70)
        layout.addWidget(self.similarity_slider)

        return page

    def create_inpaint_tab(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.inpaint_img_label = QLabel("Upload image for local editing")
        self.inpaint_img_label.setFixedHeight(150)
        self.inpaint_img_label.setAlignment(Qt.AlignCenter)
        self.inpaint_img_label.setStyleSheet("border: 2px dashed #45475a; border-radius: 8px; color: #6c7086;")
        layout.addWidget(self.inpaint_img_label)

        layout.addWidget(QLabel("Describe the area to modify:"))
        self.inpaint_prompt = QLineEdit()
        self.inpaint_prompt.setPlaceholderText("Example: change the shirt color to red")
        layout.addWidget(self.inpaint_prompt)

        tip = QLabel("💡 Seedream 5.0 supports precise semantic editing, no manual masking required")
        tip.setWordWrap(True)
        tip.setStyleSheet("color: #f9e2af; font-size: 12px;")
        layout.addWidget(tip)

        return page

    def upload_ref_image(self):
        file, _ = QFileDialog.getOpenFileName(self, "Select reference image", "", "Image files (*.png *.jpg *.jpeg)")
        if file:
            pixmap = QPixmap(file)
            self.ref_img_label.setPixmap(pixmap.scaled(280, 140, Qt.KeepAspectRatio, Qt.SmoothTransformation))
            self.current_ref_image = pixmap

    def drop_ref_image(self, event):
        for url in event.mimeData().urls():
            file = url.toLocalFile()
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                pixmap = QPixmap(file)
                self.ref_img_label.setPixmap(pixmap.scaled(280, 140, Qt.KeepAspectRatio, Qt.SmoothTransformation))
                self.current_ref_image = pixmap

    def save_prompt_to_local(self, prompt):
        data = {}
        if os.path.exists("local_data.json"):
            with open("local_data.json", "r", encoding="utf-8") as f:
                data = json.load(f)
        if "seedream_prompts" not in data:
            data["seedream_prompts"] = []
        data["seedream_prompts"].append({
            "prompt": prompt,
            "time": QDateTime.currentDateTime().toString("yyyy-MM-dd HH:mm:ss")
        })
        with open("local_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def generate_image(self):
        current_tab = self.tabs.currentIndex()
        if current_tab == 0:
            prompt = self.prompt_input.toPlainText().strip()
        elif current_tab == 1:
            prompt = self.img2img_prompt.toPlainText().strip()
        else:
            prompt = self.inpaint_prompt.text().strip()

        if not prompt:
            QMessageBox.warning(self, "Warning", "Please enter a prompt first")
            return

        self.save_prompt_to_local(prompt)

        self.gen_progress.setVisible(True)
        self.gen_progress.setValue(0)
        self.generate_btn.setDisabled(True)

        self.gen_timer = QTimer()
        self.gen_timer.timeout.connect(self.update_gen_progress)
        self.gen_timer.start(30)

    def update_gen_progress(self):
        current = self.gen_progress.value()
        if current >= 100:
            self.gen_timer.stop()
            self.generate_btn.setDisabled(False)
            self.gen_progress.setVisible(False)
            
            pixmap = QPixmap(800, 800)
            pixmap.fill(QColor("#1e1e2e"))
            painter = QPainter(pixmap)
            painter.setPen(QColor("#89b4fa"))
            painter.setFont(QFont("Segoe UI", 20, QFont.Bold))
            painter.drawText(pixmap.rect(), Qt.AlignCenter, f"Seedream 5.0 {self.model_selector.currentText()}\nGenerated Image")
            painter.end()
            
            self.current_image = pixmap
            self.preview_label.setPixmap(pixmap.scaled(
                self.preview_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation
            ))
            self.download_btn.setDisabled(False)
            self.send_to_video_btn.setDisabled(False)
            
            item = QListWidgetItem(QIcon(pixmap), f"Gen #{len(self.generated_images)+1}")
            self.gallery.addItem(item)
            self.generated_images.append(pixmap)
            return
        self.gen_progress.setValue(current + 1)

    def download_image(self):
        if not hasattr(self, 'current_image'):
            return
        file, _ = QFileDialog.getSaveFileName(self, "Save Image", "seedream_5_output.png", "PNG (*.png);;JPG (*.jpg)")
        if file:
            self.current_image.save(file)

    def send_to_video(self):
        if not hasattr(self, 'current_image'):
            return
        self.send_to_video_callback(self.current_image)
        QMessageBox.information(self, "Success", "Image sent to motion video generator")

    def load_history_image(self, item):
        index = self.gallery.row(item)
        if index < len(self.generated_images):
            self.current_image = self.generated_images[index]
            self.preview_label.setPixmap(self.current_image.scaled(
                self.preview_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation
            ))
            self.download_btn.setDisabled(False)
            self.send_to_video_btn.setDisabled(False)

# ===================== FULL INTERACTIVE VIDEO EDITOR PAGE (New!) =====================
class VideoEditorPage(QWidget):
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.media_library = []  # List of imported media files

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        self.tabs = QTabWidget()
        self.tabs.addTab(self.create_generate_tab(), "✨ AI Generate")
        self.tabs.addTab(self.create_editing_tab(), "✂️ Full Timeline + Layers Editor")
        self.tabs.addTab(self.create_export_tab(), "💾 Export")
        layout.addWidget(self.tabs)

    def create_generate_tab(self) -> QWidget:
        page = QWidget()
        main_layout = QHBoxLayout(page)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)

        left_panel = QWidget()
        left_panel.setFixedWidth(360)
        left_layout = QVBoxLayout(left_panel)
        left_layout.setSpacing(12)
        left_layout.setContentsMargins(0, 0, 0, 0)

        mode_group = QGroupBox("Generation Mode")
        mode_layout = QHBoxLayout(mode_group)
        self.text_to_video_btn = QPushButton("🎨 Text to Video")
        self.text_to_video_btn.setCheckable(True)
        self.text_to_video_btn.setChecked(True)
        self.text_to_video_btn.clicked.connect(lambda: self.switch_gen_mode(0))
        mode_layout.addWidget(self.text_to_video_btn)
        self.img_to_video_btn = QPushButton("🖼️ Image to Video")
        self.img_to_video_btn.setCheckable(True)
        self.img_to_video_btn.clicked.connect(lambda: self.switch_gen_mode(1))
        mode_layout.addWidget(self.img_to_video_btn)
        left_layout.addWidget(mode_group)

        self.prompt_group = QGroupBox("Video Prompt")
        prompt_layout = QVBoxLayout(self.prompt_group)
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Describe the video you want: e.g. cyberpunk city at night, neon signs, rain, slow camera push")
        self.prompt_input.setFixedHeight(100)
        prompt_layout.addWidget(self.prompt_input)
        left_layout.addWidget(self.prompt_group)

        style_group = QGroupBox("Style Presets")
        style_layout = QVBoxLayout(style_group)
        self.style_selector = QComboBox()
        self.style_selector.addItems([
            "Default Realistic",
            "80s Neon Retro (Official)",
            "Cyberpunk Future",
            "Anime",
            "Film Grain",
            "Minimal Ink"
        ])
        style_layout.addWidget(self.style_selector)
        left_layout.addWidget(style_group)

        param_group = QGroupBox("Basic Parameters")
        form_layout = QFormLayout(param_group)
        self.duration_selector = QSpinBox()
        self.duration_selector.setRange(1, 60)
        self.duration_selector.setValue(5)
        self.duration_selector.setSuffix(" sec")
        form_layout.addRow("Duration:", self.duration_selector)
        
        self.resolution_selector = QComboBox()
        self.resolution_selector.addItems(["1080p (1920×1080)", "720p (1280×720)", "4K (3840×2160)"])
        form_layout.addRow("Resolution:", self.resolution_selector)
        
        self.fps_selector = QSpinBox()
        self.fps_selector.setRange(24, 60)
        self.fps_selector.setValue(30)
        self.fps_selector.setSuffix(" fps")
        form_layout.addRow("Frame Rate:", self.fps_selector)
        
        self.audio_check = QCheckBox("Generate native synchronized audio")
        self.audio_check.setChecked(True)
        form_layout.addRow("", self.audio_check)
        left_layout.addWidget(param_group)

        self.motion_group = QGroupBox("🎮 Motion Control (Pro)")
        motion_layout = QVBoxLayout(self.motion_group)
        motion_layout.setSpacing(10)

        motion_layout.addWidget(QLabel("Quick Presets:"))
        preset_layout = QGridLayout()
        presets = [
            ("Zoom In", "zoom_in"),
            ("Zoom Out", "zoom_out"),
            ("Pan Left", "pan_left"),
            ("Pan Right", "pan_right"),
            ("Tilt Up", "tilt_up"),
            ("Tilt Down", "tilt_down"),
            ("Orbit", "orbit"),
            ("Dolly Zoom", "dolly_zoom")
        ]
        for i, (name, id_) in enumerate(presets):
            btn = QPushButton(name)
            btn.setProperty("secondary", "true")
            btn.clicked.connect(lambda checked, p=id_: self.apply_motion_preset(p))
            preset_layout.addWidget(btn, i//2, i%2)
        motion_layout.addLayout(preset_layout)

        motion_layout.addWidget(QLabel("Motion Intensity:"))
        self.motion_intensity = QSlider(Qt.Horizontal)
        self.motion_intensity.setRange(0, 100)
        self.motion_intensity.setValue(30)
        motion_layout.addWidget(self.motion_intensity)

        self.tracking_check = QCheckBox("🎯 AI Subject Tracking")
        motion_layout.addWidget(self.tracking_check)
        
        self.dof_check = QCheckBox("🌫️ Depth of Field Simulation")
        motion_layout.addWidget(self.dof_check)

        self.clear_keyframes_btn = QPushButton("Clear Custom Keyframes")
        self.clear_keyframes_btn.setProperty("secondary", "true")
        self.clear_keyframes_btn.clicked.connect(self.clear_keyframes)
        motion_layout.addWidget(self.clear_keyframes_btn)

        left_layout.addWidget(self.motion_group)

        left_layout.addStretch()
        self.generate_btn = QPushButton("🚀 Generate Video")
        self.generate_btn.setFixedHeight(40)
        self.generate_btn.clicked.connect(self.generate_video)
        left_layout.addWidget(self.generate_btn)

        self.generate_progress = QProgressBar()
        self.generate_progress.setVisible(False)
        left_layout.addWidget(self.generate_progress)

        main_layout.addWidget(left_panel)

        right_panel = QVBoxLayout()
        right_panel.setSpacing(12)

        self.motion_canvas = MotionCanvas()
        self.motion_canvas.setMinimumHeight(400)
        self.motion_canvas.setText("🎬 Video Preview Area\n\nText to Video: preview after generation\nImage to Video: upload reference image to draw motion path")
        right_panel.addWidget(self.motion_canvas, stretch=1)

        control_bar = QHBoxLayout()
        self.play_btn = QPushButton("▶️ Play")
        self.play_btn.clicked.connect(self.toggle_play)
        control_bar.addWidget(self.play_btn)
        self.progress_slider = QSlider(Qt.Horizontal)
        control_bar.addWidget(self.progress_slider, stretch=1)
        self.time_label = QLabel("00:00 / 00:00")
        control_bar.addWidget(self.time_label)
        right_panel.addLayout(control_bar)

        main_layout.addLayout(right_panel, stretch=1)

        self.media_player = QMediaPlayer()
        self.audio_output = QAudioOutput()
        self.media_player.setAudioOutput(self.audio_output)

        return page

    def switch_gen_mode(self, mode):
        if mode == 0:
            self.text_to_video_btn.setChecked(True)
            self.img_to_video_btn.setChecked(False)
            self.prompt_group.setVisible(True)
            self.motion_canvas.setText("🎬 Text to Video Preview Area")
        else:
            self.text_to_video_btn.setChecked(False)
            self.img_to_video_btn.setChecked(True)
            self.prompt_group.setVisible(False)
            self.motion_canvas.setText("🖼️ Image to Video Mode\n\nClick canvas to add keyframes, custom camera motion path")

    def apply_motion_preset(self, preset):
        self.motion_canvas.clear_keyframes()
        width = self.motion_canvas.width()
        height = self.motion_canvas.height()
        presets = {
            "zoom_in": [QPointF(width/2, height/2), QPointF(width/2, height/2)],
            "zoom_out": [QPointF(width/2, height/2), QPointF(width/2, height/2)],
            "pan_left": [QPointF(width*0.8, height/2), QPointF(width*0.2, height/2)],
            "pan_right": [QPointF(width*0.2, height/2), QPointF(width*0.8, height/2)],
            "tilt_up": [QPointF(width/2, height*0.8), QPointF(width/2, height*0.2)],
            "tilt_down": [QPointF(width/2, height*0.2), QPointF(width/2, height*0.8)],
            "orbit": [QPointF(width/2, height/2)],
            "dolly_zoom": [QPointF(width/2, height/2), QPointF(width/2, height/2)]
        }
        if preset in presets:
            for point in presets[preset]:
                self.motion_canvas.keyframes.append(point)
            self.motion_canvas.update()

    def clear_keyframes(self):
        self.motion_canvas.clear_keyframes()

    def create_editing_tab(self) -> QWidget:
        page = QWidget()
        main_layout = QVBoxLayout(page)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(12)

        # Top: Preview + Media Library + AI Tools
        top_splitter = QSplitter(Qt.Horizontal)

        # Left: Media Library
        media_group = QGroupBox("📁 Media Library")
        media_layout = QVBoxLayout(media_group)
        upload_btn = QPushButton("📤 Import Media")
        upload_btn.clicked.connect(self.import_media)
        media_layout.addWidget(upload_btn)
        self.media_list = QListWidget()
        self.media_list.setViewMode(QListWidget.IconMode)
        self.media_list.setIconSize(QSize(100, 60))
        self.media_list.setDragEnabled(True)
        media_layout.addWidget(self.media_list)
        top_splitter.addWidget(media_group)

        # Middle: Preview Player
        preview_group = QGroupBox("👁️ Preview")
        preview_layout = QVBoxLayout(preview_group)
        self.edit_preview = QVideoWidget()
        self.edit_preview.setStyleSheet("background-color: #181825; border-radius: 8px;")
        self.edit_preview.setMinimumHeight(350)
        preview_layout.addWidget(self.edit_preview)
        # Preview controls
        preview_controls = QHBoxLayout()
        self.edit_play_btn = QPushButton("▶️ Play")
        self.edit_play_btn.clicked.connect(self.toggle_edit_play)
        preview_controls.addWidget(self.edit_play_btn)
        self.edit_seek = QSlider(Qt.Horizontal)
        preview_controls.addWidget(self.edit_seek, stretch=1)
        self.edit_time = QLabel("00:00 / 00:00")
        preview_controls.addWidget(self.edit_time)
        preview_layout.addLayout(preview_controls)
        top_splitter.addWidget(preview_group)

        # Right: AI Tools
        ai_tools_group = QGroupBox("🤖 AI Editing Tools")
        ai_layout = QVBoxLayout(ai_tools_group)
        ai_tools = [
            ("🎬 AI Auto Edit", "auto_edit"),
            ("🎵 Beat Sync Cut", "beat_sync"),
            ("📝 Auto Subtitles", "subtitles"),
            ("✨ 4K Enhance", "enhance"),
            ("🔄 Frame Interpolation", "interpolate"),
            ("🎭 Style Transfer", "style"),
            ("🗑️ Remove Object", "remove_object"),
            ("💬 Add Text", "text")
        ]
        for name, action in ai_tools:
            btn = QPushButton(name)
            btn.setProperty("secondary", "true")
            btn.setStyleSheet("text-align:left; padding: 10px;")
            btn.clicked.connect(lambda checked, a=action: self.run_ai_edit_tool(a))
            ai_layout.addWidget(btn)
        ai_layout.addStretch()
        top_splitter.addWidget(ai_tools_group)

        top_splitter.setSizes([200, 600, 200])
        main_layout.addWidget(top_splitter, stretch=5)

        # Layer stack / compositor controls\n        self.layers = []\n        main_layout.addWidget(self.create_layers_panel(), stretch=2)\n\n        # Bottom: Full Timeline
        timeline_group = QGroupBox("⏱️ Timeline Editor (drag clips from media library)")
        timeline_layout = QVBoxLayout(timeline_group)

        # Timeline ruler
        self.timeline_ruler = QSlider(Qt.Horizontal)
        self.timeline_ruler.setRange(0, 600)
        timeline_layout.addWidget(self.timeline_ruler)

        # Tracks
        self.tracks = []
        track_configs = [
            ("Video", "#89b4fa", "video"),
            ("Audio", "#a6e3a1", "audio"),
            ("Subtitles", "#f9e2af", "subtitle"),
            ("Effects", "#cba6f7", "effect")
        ]
        for track_name, color, track_type in track_configs:
            track_row = QHBoxLayout()
            track_label = QLabel(track_name)
            track_label.setFixedWidth(70)
            track_row.addWidget(track_label)
            track_widget = QFrame()
            track_widget.setStyleSheet(f"background-color: {color}15; border: 1px solid {color}40; border-radius: 4px;")
            track_widget.setFixedHeight(35)
            track_widget.setAcceptDrops(True)
            track_widget.track_type = track_type
            track_widget.dragEnterEvent = lambda e: e.acceptProposedAction()
            track_widget.dropEvent = lambda e, t=track_widget: self.add_clip_to_track(e, t)
            track_row.addWidget(track_widget)
            self.tracks.append(track_widget)
            timeline_layout.addLayout(track_row)

        main_layout.addWidget(timeline_group, stretch=2)

        # Edit player
        self.edit_player = QMediaPlayer()
        self.edit_player.setVideoOutput(self.edit_preview)

        return page


    def create_layers_panel(self) -> QWidget:
        group = QGroupBox("🧩 Layers / Compositor")
        layout = QVBoxLayout(group)
        toolbar = QHBoxLayout()

        for label, layer_type in [
            ("🎬 Video", "video"),
            ("🖼️ Image", "image"),
            ("T Text", "text"),
            ("🎵 Audio", "audio"),
            ("✨ Overlay", "overlay"),
        ]:
            btn = QPushButton(label)
            btn.setProperty("secondary", "true")
            btn.clicked.connect(lambda checked=False, t=layer_type: self.add_editor_layer(t))
            toolbar.addWidget(btn)

        remove_btn = QPushButton("🗑️")
        remove_btn.setProperty("secondary", "true")
        remove_btn.clicked.connect(self.remove_editor_layer)
        toolbar.addWidget(remove_btn)
        layout.addLayout(toolbar)

        body = QHBoxLayout()
        self.layer_list = QListWidget()
        self.layer_list.setMaximumHeight(150)
        self.layer_list.currentRowChanged.connect(self.on_layer_selected)
        body.addWidget(self.layer_list, stretch=2)

        inspector = QFormLayout()
        self.layer_name = QLineEdit()
        self.layer_name.editingFinished.connect(self.apply_layer_properties)
        inspector.addRow("Name", self.layer_name)

        self.layer_visible = QCheckBox("Visible")
        self.layer_visible.setChecked(True)
        self.layer_visible.stateChanged.connect(self.apply_layer_properties)
        inspector.addRow("", self.layer_visible)

        self.layer_locked = QCheckBox("Locked")
        self.layer_locked.stateChanged.connect(self.apply_layer_properties)
        inspector.addRow("", self.layer_locked)

        self.layer_opacity = QDoubleSpinBox()
        self.layer_opacity.setRange(0.0, 1.0)
        self.layer_opacity.setSingleStep(0.05)
        self.layer_opacity.setValue(1.0)
        self.layer_opacity.valueChanged.connect(self.apply_layer_properties)
        inspector.addRow("Opacity", self.layer_opacity)

        self.layer_x = QDoubleSpinBox()
        self.layer_x.setRange(-100.0, 100.0)
        self.layer_x.setSingleStep(1.0)
        self.layer_x.valueChanged.connect(self.apply_layer_properties)
        inspector.addRow("X", self.layer_x)

        self.layer_y = QDoubleSpinBox()
        self.layer_y.setRange(-100.0, 100.0)
        self.layer_y.setSingleStep(1.0)
        self.layer_y.valueChanged.connect(self.apply_layer_properties)
        inspector.addRow("Y", self.layer_y)

        self.layer_scale = QDoubleSpinBox()
        self.layer_scale.setRange(0.1, 4.0)
        self.layer_scale.setSingleStep(0.05)
        self.layer_scale.setValue(1.0)
        self.layer_scale.valueChanged.connect(self.apply_layer_properties)
        inspector.addRow("Scale", self.layer_scale)

        body.addLayout(inspector, stretch=3)
        layout.addLayout(body)

        order = QHBoxLayout()
        for label, direction in [("↑ Move Up", -1), ("↓ Move Down", 1)]:
            btn = QPushButton(label)
            btn.setProperty("secondary", "true")
            btn.clicked.connect(lambda checked=False, d=direction: self.move_editor_layer(d))
            order.addWidget(btn)
        add_timeline = QPushButton("➕ Insert into Timeline")
        add_timeline.clicked.connect(self.insert_selected_layer_to_timeline)
        order.addWidget(add_timeline)
        layout.addLayout(order)

        return group

    def add_editor_layer(self, layer_type):
        index = len(self.layers) + 1
        names = {
            "video": f"Video Layer {index}",
            "image": f"Image Layer {index}",
            "text": f"Text Layer {index}",
            "audio": f"Audio Layer {index}",
            "overlay": f"Overlay Layer {index}",
        }
        layer = {
            "id": f"layer-{index}-{layer_type}",
            "type": layer_type,
            "name": names[layer_type],
            "visible": True,
            "locked": False,
            "opacity": 1.0,
            "x": 0.0,
            "y": 0.0,
            "scale": 1.0,
            "content": "",
        }
        if layer_type in ("video", "image", "audio"):
            files, _ = QFileDialog.getOpenFileNames(self, f"Select {layer_type} media", "", "Media files (*.mp4 *.mov *.avi *.mp3 *.wav *.png *.jpg *.jpeg *.gif)")
            if files:
                layer["content"] = files[0]
                layer["name"] = os.path.basename(files[0])
        elif layer_type == "text":
            layer["content"] = "Your text"
        self.layers.append(layer)
        self.refresh_layer_list()
        self.layer_list.setCurrentRow(len(self.layers) - 1)

    def refresh_layer_list(self):
        self.layer_list.blockSignals(True)
        self.layer_list.clear()
        for layer in self.layers:
            state = "" if layer["visible"] else " (hidden)"
            lock = " 🔒" if layer["locked"] else ""
            self.layer_list.addItem(f'{layer["name"]} · {layer["type"]}{state}{lock}')
        self.layer_list.blockSignals(False)

    def on_layer_selected(self, row):
        if row < 0 or row >= len(self.layers):
            return
        layer = self.layers[row]
        self.layer_name.blockSignals(True)
        self.layer_name.setText(layer["name"])
        self.layer_name.blockSignals(False)
        for widget, value in [
            (self.layer_visible, layer["visible"]),
            (self.layer_locked, layer["locked"]),
        ]:
            widget.blockSignals(True)
            widget.setChecked(value)
            widget.blockSignals(False)
        for widget, value in [
            (self.layer_opacity, layer["opacity"]),
            (self.layer_x, layer["x"]),
            (self.layer_y, layer["y"]),
            (self.layer_scale, layer["scale"]),
        ]:
            widget.blockSignals(True)
            widget.setValue(value)
            widget.blockSignals(False)

    def apply_layer_properties(self, *args):
        row = self.layer_list.currentRow()
        if row < 0 or row >= len(self.layers):
            return
        layer = self.layers[row]
        layer.update({
            "name": self.layer_name.text(),
            "visible": self.layer_visible.isChecked(),
            "locked": self.layer_locked.isChecked(),
            "opacity": self.layer_opacity.value(),
            "x": self.layer_x.value(),
            "y": self.layer_y.value(),
            "scale": self.layer_scale.value(),
        })
        self.refresh_layer_list()
        self.layer_list.setCurrentRow(row)

    def remove_editor_layer(self):
        row = self.layer_list.currentRow()
        if row < 0:
            return
        self.layers.pop(row)
        self.refresh_layer_list()
        if self.layers:
            self.layer_list.setCurrentRow(min(row, len(self.layers) - 1))

    def move_editor_layer(self, direction):
        row = self.layer_list.currentRow()
        target = row + direction
        if row < 0 or target < 0 or target >= len(self.layers):
            return
        self.layers[row], self.layers[target] = self.layers[target], self.layers[row]
        self.refresh_layer_list()
        self.layer_list.setCurrentRow(target)

    def insert_selected_layer_to_timeline(self):
        row = self.layer_list.currentRow()
        if row < 0 or row >= len(self.layers):
            QMessageBox.information(self, "Layers", "Select a layer first.")
            return
        layer = self.layers[row]
        track_type = "video" if layer["type"] == "video" else "audio" if layer["type"] == "audio" else "effect"
        track = next((t for t in self.tracks if getattr(t, "track_type", None) == track_type), None)
        if track is None:
            QMessageBox.information(self, "Layers", "No compatible timeline track is available.")
            return
        clip = QFrame(track)
        clip.setProperty("timelineClip", "true")
        clip.setFixedSize(120, 25)
        clip.move(20 + len(track.findChildren(QFrame)) * 8, 5)
        clip_label = QLabel(layer["name"], clip)
        clip_label.setStyleSheet("font-size: 10px; color: white; padding: 2px;")
        clip.show()
        QMessageBox.information(self, "Layers", f'{layer["name"]} inserted into the {track_type} timeline track.')

    def import_media(self):
        files, _ = QFileDialog.getOpenFileNames(self, "Import Media", "", 
            "Media files (*.mp4 *.mov *.avi *.mp3 *.wav *.png *.jpg *.jpeg *.gif)")
        for file in files:
            filename = os.path.basename(file)
            item = QListWidgetItem(QIcon(), filename)
            item.setData(Qt.UserRole, file)
            self.media_list.addItem(item)
            self.media_library.append(file)
        QMessageBox.information(self, "Success", f"Imported {len(files)} files to media library")

    def add_clip_to_track(self, event, track_widget):
        if event.mimeData().hasUrls():
            for url in event.mimeData().urls():
                file_path = url.toLocalFile()
                clip = QFrame(track_widget)
                clip.setProperty("timelineClip", "true")
                clip.setFixedSize(80, 25)
                clip.move(20, 5)
                clip_label = QLabel(os.path.basename(file_path), clip)
                clip_label.setStyleSheet("font-size: 10px; color: white; padding: 2px;")
                clip.show()
        else:
            # Drag from media list
            item = self.media_list.currentItem()
            if item:
                file_path = item.data(Qt.UserRole)
                clip = QFrame(track_widget)
                clip.setProperty("timelineClip", "true")
                clip.setFixedSize(80, 25)
                clip.move(20, 5)
                clip_label = QLabel(os.path.basename(file_path), clip)
                clip_label.setStyleSheet("font-size: 10px; color: white; padding: 2px;")
                clip.show()

    def run_ai_edit_tool(self, action):
        tool_names = {
            "auto_edit": "AI Auto Edit",
            "beat_sync": "Beat Sync Cut",
            "subtitles": "Auto Subtitles",
            "enhance": "4K Quality Enhance",
            "interpolate": "Frame Interpolation",
            "style": "Style Transfer",
            "remove_object": "Object Removal",
            "text": "Add Text Layer"
        }
        if action == "auto_edit":
            response = QMessageBox.question(self, "AI Auto Edit", 
                "AI will automatically edit your footage to match the music beat, add transitions, and create a final cut.\nContinue?")
            if response == QMessageBox.Yes:
                QMessageBox.information(self, "AI Auto Edit", "AI edit started! Timeline will be populated automatically.")
        else:
            QMessageBox.information(self, tool_names[action], 
                f"{tool_names[action]} tool activated! Select clips on the timeline to apply.")

    def toggle_edit_play(self):
        if self.edit_player.playbackState() == QMediaPlayer.PlayingState:
            self.edit_player.pause()
            self.edit_play_btn.setText("▶️ Play")
        else:
            self.edit_player.play()
            self.edit_play_btn.setText("⏸️ Pause")

    def create_export_tab(self) -> QWidget:
        page = QWidget()
        layout = QFormLayout(page)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(15)

        self.export_format = QComboBox()
        self.export_format.addItems(["MP4 (H.264)", "MOV (ProRes)", "WEBM", "GIF", "PNG Sequence"])
        layout.addRow("Format:", self.export_format)

        self.export_resolution = QComboBox()
        self.export_resolution.addItems(["1080p", "2K", "4K", "720p"])
        layout.addRow("Resolution:", self.export_resolution)

        self.export_fps = QSpinBox()
        self.export_fps.setRange(24, 120)
        self.export_fps.setValue(30)
        layout.addRow("Frame Rate:", self.export_fps)

        self.export_bitrate = QSpinBox()
        self.export_bitrate.setRange(1, 50)
        self.export_bitrate.setValue(8)
        self.export_bitrate.setSuffix(" Mbps")
        layout.addRow("Bitrate:", self.export_bitrate)

        self.export_btn = QPushButton("💾 Export Video")
        self.export_btn.setFixedHeight(40)
        self.export_btn.clicked.connect(lambda: QMessageBox.information(self, "Export", "Export task started! You will be notified when complete."))
        layout.addRow("", self.export_btn)

        return page

    def set_prompt(self, text):
        self.prompt_input.setPlainText(text)
        self.tabs.setCurrentIndex(0)
        self.switch_gen_mode(0)

    def set_reference_image(self, pixmap):
        self.tabs.setCurrentIndex(0)
        self.switch_gen_mode(1)
        self.motion_canvas.set_reference_image(pixmap)
        self.current_ref_image = pixmap

    def generate_video(self):
        if self.text_to_video_btn.isChecked():
            prompt = self.prompt_input.toPlainText().strip()
            if not prompt:
                QMessageBox.warning(self, "Warning", "Please enter a video prompt")
                return
        else:
            if not hasattr(self, 'current_ref_image'):
                QMessageBox.warning(self, "Warning", "Please upload a reference image first")
                return
        
        self.generate_progress.setVisible(True)
        self.generate_progress.setValue(0)
        self.generate_btn.setDisabled(True)

        self.gen_timer = QTimer()
        self.gen_timer.timeout.connect(self.update_gen_progress)
        self.gen_timer.start(80)

    def update_gen_progress(self):
        current = self.generate_progress.value()
        if current >= 100:
            self.gen_timer.stop()
            self.generate_btn.setDisabled(False)
            self.generate_progress.setVisible(False)
            QMessageBox.information(self, "Generation Complete", "Video generated! You can edit it in the timeline editor now.")
            return
        self.generate_progress.setValue(current + 1)

    def toggle_play(self):
        if self.media_player.playbackState() == QMediaPlayer.PlayingState:
            self.media_player.pause()
            self.play_btn.setText("▶️ Play")
        else:
            self.media_player.play()
            self.play_btn.setText("⏸️ Pause")

# ===================== Dola Seed 2.1 Chat Page =====================
class DolaChatPage(QWidget):
    def __init__(self, send_to_editor_callback, send_to_seedream_callback):
        super().__init__()
        self.send_to_editor_callback = send_to_editor_callback
        self.send_to_seedream_callback = send_to_seedream_callback
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        top_bar = QHBoxLayout()
        top_bar.addWidget(QLabel("🧠 Dola Seed 2.1 Model:"))
        self.model_selector = QComboBox()
        self.model_selector.addItems([
            "Dola Seed 2.1 Pro (Full Feature)",
            "Dola Seed 2.1 Lite (Fast)",
            "Dola Seed 2.1 Mini (Low Power)",
            "Dola Seed 2.1 Code (Programming)"
        ])
        top_bar.addWidget(self.model_selector)
        top_bar.addStretch()
        self.clear_btn = QPushButton("Clear Chat")
        self.clear_btn.setProperty("secondary", "true")
        self.clear_btn.clicked.connect(self.clear_chat)
        top_bar.addWidget(self.clear_btn)
        layout.addLayout(top_bar)

        self.chat_history = QTextEdit()
        self.chat_history.setReadOnly(True)
        self.chat_history.setFont(QFont("Segoe UI", 10))
        self.chat_history.setHtml("""
            <div style='color:#89b4fa; font-weight:bold; font-size:14px;'>👋 Welcome to Dola Seed 2.1 Pro</div>
            <div style='margin-top:8px;'>I can help you with:<br>
            ✍️ Write video scripts / image prompts<br>
            💻 Generate / debug code<br>
            🖼️ Analyze images / video content<br>
            🤖 Run multi-step agent workflows<br>
            Type your request, or drag files to start chatting
            </div>
        """)
        layout.addWidget(self.chat_history, stretch=8)

        self.input_box = QTextEdit()
        self.input_box.setFixedHeight(100)
        self.input_box.setPlaceholderText("Type your message... Drag images/videos here to add as context")
        self.input_box.setAcceptDrops(True)
        self.input_box.dragEnterEvent = self.drag_enter_event
        self.input_box.dropEvent = self.drop_event
        layout.addWidget(self.input_box, stretch=2)

        bottom_bar = QHBoxLayout()
        self.upload_btn = QPushButton("📎 Upload File")
        self.upload_btn.setProperty("secondary", "true")
        self.upload_btn.clicked.connect(self.upload_file)
        bottom_bar.addWidget(self.upload_btn)
        
        self.send_to_seedream_btn = QPushButton("🖼️ Send to Seedream")
        self.send_to_seedream_btn.setProperty("secondary", "true")
        self.send_to_seedream_btn.clicked.connect(self.send_to_seedream)
        bottom_bar.addWidget(self.send_to_seedream_btn)
        
        self.send_to_editor_btn = QPushButton("🎬 Send to Video Editor")
        self.send_to_editor_btn.setProperty("secondary", "true")
        self.send_to_editor_btn.clicked.connect(self.send_to_editor)
        bottom_bar.addWidget(self.send_to_editor_btn)
        
        bottom_bar.addStretch()
        self.send_btn = QPushButton("Send (Ctrl+Enter)")
        self.send_btn.setFixedWidth(150)
        self.send_btn.clicked.connect(self.send_message)
        bottom_bar.addWidget(self.send_btn)
        layout.addLayout(bottom_bar)

    def drag_enter_event(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()

    def drop_event(self, event: QDropEvent):
        for url in event.mimeData().urls():
            file_path = url.toLocalFile()
            self.input_box.append(f"[Added attachment: {os.path.basename(file_path)}]")

    def upload_file(self):
        file, _ = QFileDialog.getOpenFileName(self, "Select File", "", 
            "Media files (*.png *.jpg *.jpeg *.mp4 *.mov *.avi);;All files (*)")
        if file:
            self.input_box.append(f"[Added attachment: {os.path.basename(file)}]")

    def clear_chat(self):
        self.chat_history.clear()
        self.chat_history.setHtml("""
            <div style='color:#89b4fa; font-weight:bold; font-size:14px;'>👋 Welcome to Dola Seed 2.1 Pro</div>
            <div style='margin-top:8px;'>I can help you with:<br>
            ✍️ Write video scripts / image prompts<br>
            💻 Generate / debug code<br>
            🖼️ Analyze images / video content<br>
            🤖 Run multi-step agent workflows<br>
            Type your request, or drag files to start chatting
            </div>
        """)

    def save_chat_to_local(self, user_input, ai_reply):
        data = {}
        if os.path.exists("local_data.json"):
            with open("local_data.json", "r", encoding="utf-8") as f:
                data = json.load(f)
        if "chat_history" not in data:
            data["chat_history"] = []
        data["chat_history"].append({
            "user": user_input,
            "ai": ai_reply,
            "time": QDateTime.currentDateTime().toString("yyyy-MM-dd HH:mm:ss")
        })
        with open("local_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def send_message(self):
        user_input = self.input_box.toPlainText().strip()
        if not user_input:
            return
        
        self.chat_history.append(f"""
            <div style='margin:10px 0;'>
                <div style='color:#a6e3a1; font-weight:bold;'>You:</div>
                <div style='margin-top:4px; white-space:pre-wrap;'>{user_input}</div>
            </div>
        """)
        self.input_box.clear()
        self.send_btn.setDisabled(True)

        QTimer.singleShot(1000, lambda: self.show_ai_response(user_input))

    def show_ai_response(self, user_input):
        ai_reply = f"""
🤖 Dola Seed 2.1 Response:
I understand your request: "{user_input[:50]}..."
---
✅ I've created a creative plan for you:
1. Click "Send to Seedream" to generate reference images
2. Click "Send to Video Editor" to generate video directly
💡 Tip: Tell me more details (style, duration, camera movement) to optimize results
        """
        self.chat_history.append(f"""
            <div style='margin:10px 0;'>
                <div style='color:#89b4fa; font-weight:bold;'>Dola Seed 2.1:</div>
                <div style='margin-top:4px; white-space:pre-wrap; background:#181825; padding:8px; border-radius:6px;'>{ai_reply}</div>
            </div>
        """)
        self.send_btn.setDisabled(False)
        self.last_content = user_input
        self.save_chat_to_local(user_input, ai_reply)

    def send_to_editor(self):
        content = self.input_box.toPlainText().strip() or getattr(self, 'last_content', '')
        if not content:
            QMessageBox.warning(self, "Warning", "Please enter or generate a video script first")
            return
        self.send_to_editor_callback(content)
        QMessageBox.information(self, "Success", "Script sent to AI video editor")

    def send_to_seedream(self):
        content = self.input_box.toPlainText().strip() or getattr(self, 'last_content', '')
        if not content:
            QMessageBox.warning(self, "Warning", "Please enter or generate an image prompt first")
            return
        self.send_to_seedream_callback(content)
        QMessageBox.information(self, "Success", "Prompt sent to Seedream 5.0")

# ===================== AI Code Editor Page =====================
class CodeEditorPage(QWidget):
    def __init__(self):
        super().__init__()
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)
        layout.addWidget(QLabel("💻 AI Code Editor", font=QFont("Segoe UI", 16, QFont.Bold)))
        content_layout = QHBoxLayout()
        
        editor_group = QGroupBox("Code Editor")
        editor_layout = QVBoxLayout(editor_group)
        self.code_editor = QTextEdit()
        self.code_editor.setFont(QFont("Consolas", 11))
        self.code_editor.setPlaceholderText("// Write your code here, or ask AI to generate/debug")
        self.code_editor.setPlainText("# Write your code here\n# Ask AI to generate, explain, debug, optimize, or refactor")
        editor_layout.addWidget(self.code_editor)
        content_layout.addWidget(editor_group, stretch=2)

        right_panel = QVBoxLayout()
        
        ai_group = QGroupBox("AI Assistant")
        ai_layout = QVBoxLayout(ai_group)
        ai_layout.addWidget(QLabel("Model:"))
        self.code_model = QComboBox()
        self.code_model.addItems(["DeepSeek Coder V2", "GLM-5.1", "Code Llama 70B", "Dola Seed 2.1 Code"])
        ai_layout.addWidget(self.code_model)
        ai_layout.addWidget(QLabel("Prompt:"))
        self.code_prompt = QTextEdit()
        self.code_prompt.setFixedHeight(80)
        self.code_prompt.setPlaceholderText("Describe what you want to do with the code...")
        ai_layout.addWidget(self.code_prompt)
        
        btn_grid = QGridLayout()
        actions = [
            ("Explain", "explain"),
            ("Debug", "debug"),
            ("Optimize", "optimize"),
            ("Refactor", "refactor")
        ]
        for i, (name, action) in enumerate(actions):
            btn = QPushButton(name)
            btn.setProperty("secondary", "true")
            btn.clicked.connect(lambda checked, a=action: self.run_ai_action(a))
            btn_grid.addWidget(btn, i//2, i%2)
        ai_layout.addLayout(btn_grid)
        right_panel.addWidget(ai_group)

        output_group = QGroupBox("AI Output")
        output_layout = QVBoxLayout(output_group)
        self.code_output = QTextEdit()
        self.code_output.setReadOnly(True)
        self.code_output.setPlaceholderText("AI output will appear here")
        output_layout.addWidget(self.code_output)
        right_panel.addWidget(output_group, stretch=1)

        content_layout.addLayout(right_panel, stretch=1)
        layout.addLayout(content_layout, stretch=1)

    def run_ai_action(self, action):
        prompt = self.code_prompt.toPlainText().strip() or f"Perform {action} on the code"
        self.code_output.setText(f"🤖 AI ({self.code_model.currentText()}) {action} result:\n\n(Connect your ModelArk API key in Settings for real results)\n\nAnalysis of your code will appear here.")

# ===================== Projects Page =====================
class ProjectsPage(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)

        top_bar = QHBoxLayout()
        top_bar.addWidget(QLabel("📂 My Projects", font=QFont("Segoe UI", 14, QFont.Bold)))
        top_bar.addStretch()
        new_btn = QPushButton("+ New Project")
        top_bar.addWidget(new_btn)
        layout.addLayout(top_bar)

        self.project_list = QListWidget()
        self.project_list.setViewMode(QListWidget.IconMode)
        self.project_list.setIconSize(QSize(200, 120))
        self.project_list.setResizeMode(QListWidget.Adjust)
        self.project_list.setSpacing(20)

        sample_projects = [
            ("Short Video Script 1", "2024-05-20", "Dola Seed Chat"),
            ("Product Promo Video", "2024-05-19", "Seedance Video Project"),
            ("Poster Design", "2024-05-18", "Seedream Image Project"),
            ("Code Debug Log", "2024-05-17", "Dola Seed Chat"),
        ]
        for name, date, type_ in sample_projects:
            item = QListWidgetItem(QIcon(), f"{name}\n{date}\n{type_}")
            item.setTextAlignment(Qt.AlignCenter)
            self.project_list.addItem(item)

        layout.addWidget(self.project_list)

# ===================== Settings Page =====================
class SettingsPage(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)

        layout.addWidget(QLabel("⚙️ Application Settings", font=QFont("Segoe UI", 16, QFont.Bold)))

        api_group = QGroupBox("🔑 ModelArk API Configuration")
        api_layout = QFormLayout(api_group)
        api_layout.setSpacing(12)

        self.base_url_input = QLineEdit()
        self.base_url_input.setPlaceholderText("https://api.byteplus.com/v1/modelark")
        api_layout.addRow("API Endpoint:", self.base_url_input)

        self.access_key_input = QLineEdit()
        self.access_key_input.setPlaceholderText("Your BytePlus Access Key")
        api_layout.addRow("Access Key:", self.access_key_input)

        self.secret_key_input = QLineEdit()
        self.secret_key_input.setEchoMode(QLineEdit.Password)
        self.secret_key_input.setPlaceholderText("Your BytePlus Secret Key (stored locally only)")
        api_layout.addRow("Secret Key:", self.secret_key_input)

        api_tip = QLabel("💡 Get your keys at <a href='https://www.byteplus.com/en/product/ModelArk' style='color:#89b4fa;'>BytePlus ModelArk</a>")
        api_tip.setOpenExternalLinks(True)
        api_layout.addRow("", api_tip)

        layout.addWidget(api_group)

        model_group = QGroupBox("🤖 Default Models")
        model_layout = QFormLayout(model_group)
        self.default_dola = QComboBox()
        self.default_dola.addItems(["Dola Seed 2.1 Pro", "Dola Seed 2.1 Lite", "Dola Seed 2.1 Mini"])
        model_layout.addRow("Default Dola Model:", self.default_dola)
        
        self.default_seedream = QComboBox()
        self.default_seedream.addItems(["Seedream 5.0 Pro", "Seedream 5.0 Lite", "Seedream 5.0 Pro Max"])
        model_layout.addRow("Default Seedream Model:", self.default_seedream)
        layout.addWidget(model_group)

        general_group = QGroupBox("General Settings")
        general_layout = QFormLayout(general_group)
        self.theme_selector = QComboBox()
        self.theme_selector.addItems(["Dark Theme", "Light Theme", "System Default"])
        general_layout.addRow("UI Theme:", self.theme_selector)
        
        self.auto_save_check = QCheckBox("Auto-save projects (every 5 minutes)")
        self.auto_save_check.setChecked(True)
        general_layout.addRow("", self.auto_save_check)

        self.hardware_accel_check = QCheckBox("Enable hardware acceleration (GPU rendering)")
        self.hardware_accel_check.setChecked(True)
        general_layout.addRow("", self.hardware_accel_check)
        layout.addWidget(general_group)

        layout.addStretch()

        save_btn = QPushButton("💾 Save Settings")
        save_btn.setFixedWidth(150)
        save_btn.clicked.connect(lambda: QMessageBox.information(self, "Success", "Settings saved, restart app to apply changes"))
        layout.addWidget(save_btn, alignment=Qt.AlignRight)

# ===================== Main Window =====================
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Dola Seed Studio 2.1 Pro | Desktop Native GUI + Full Timeline Editor")
        self.setGeometry(100, 100, 1600, 950)
        self.setStyleSheet(STYLE_SHEET)

        self.video_editor = VideoEditorPage()
        self.seedream_page = SeedreamPage(self.video_editor.set_reference_image)
        self.code_editor_page = CodeEditorPage()
        self.chat_page = DolaChatPage(self.video_editor.set_prompt, self.send_prompt_to_seedream)
        self.projects_page = ProjectsPage()
        self.settings_page = SettingsPage()

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        self.sidebar = QListWidget()
        self.sidebar.setFixedWidth(240)
        menu_items = [
            ("🧠 Dola Seed 2.1 Assistant", 0),
            ("🖼️ Seedream 5.0 Images", 1),
            ("🎬 AI Video Editor", 2),
            ("💻 AI Code Editor", 3),
            ("📂 Projects", 4),
            ("⚙️ Settings", 5)
        ]
        for name, index in menu_items:
            item = QListWidgetItem(name)
            self.sidebar.addItem(item)
        self.sidebar.currentRowChanged.connect(self.switch_page)
        self.sidebar.setCurrentRow(0)
        main_layout.addWidget(self.sidebar)

        self.content_stack = QStackedWidget()
        self.content_stack.addWidget(self.chat_page)
        self.content_stack.addWidget(self.seedream_page)
        self.content_stack.addWidget(self.video_editor)
        self.content_stack.addWidget(self.code_editor_page)
        self.content_stack.addWidget(self.projects_page)
        self.content_stack.addWidget(self.settings_page)
        main_layout.addWidget(self.content_stack)

        self.sliding_panel = SlidingBottomPanel(central_widget)
        self.toggle_slider_btn = QPushButton("⚡ Quick Panel")
        self.toggle_slider_btn.setProperty("secondary", "true")
        self.toggle_slider_btn.clicked.connect(self.sliding_panel.toggle)

        self.quick_popup = QuickPopup(central_widget)

        self.setStatusBar(QStatusBar())
        self.statusBar().addPermanentWidget(self.toggle_slider_btn)
        self.statusBar().showMessage("✅ Dola Seed Studio Ready | Full timeline editor enabled | Press E for quick access")

    def keyPressEvent(self, event: QKeyEvent):
        if event.key() == Qt.Key_E and not event.isAutoRepeat():
            self.quick_popup.toggle(self.geometry())
        super().keyPressEvent(event)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        if hasattr(self, 'sliding_panel'):
            self.sliding_panel.resize(self.width(), self.sliding_panel.panel_height)
            if not self.sliding_panel.is_open:
                self.sliding_panel.move(0, self.height())

    def switch_page(self, index):
        current_widget = self.content_stack.currentWidget()
        effect = QGraphicsOpacityEffect(current_widget)
        current_widget.setGraphicsEffect(effect)
        anim = QPropertyAnimation(effect, b"opacity")
        anim.setDuration(150)
        anim.setStartValue(1)
        anim.setEndValue(0)
        anim.finished.connect(lambda: self._finish_page_switch(index))
        anim.start()

    def _finish_page_switch(self, index):
        self.content_stack.setCurrentIndex(index)
        next_widget = self.content_stack.currentWidget()
        effect = QGraphicsOpacityEffect(next_widget)
        next_widget.setGraphicsEffect(effect)
        anim = QPropertyAnimation(effect, b"opacity")
        anim.setDuration(150)
        anim.setStartValue(0)
        anim.setEndValue(1)
        anim.start()
        page_names = [
            "Dola Seed 2.1 Assistant", 
            "Seedream 5.0 Image Generation", 
            "AI Video Editor", 
            "AI Code Editor",
            "Projects", 
            "Settings"
        ]
        self.statusBar().showMessage(f"Current: {page_names[index]} | Press E for quick access")

    def send_prompt_to_seedream(self, prompt):
        self.seedream_page.tabs.setCurrentIndex(0)
        self.seedream_page.prompt_input.setPlainText(prompt)
        self.sidebar.setCurrentRow(1)

# ===================== Launch Application =====================
if __name__ == "__main__":
    from PySide6.QtCore import QDateTime
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())