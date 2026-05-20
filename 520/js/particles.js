/**
 * 520 Cloud Museum - Cinematic 3D Heart Nebula & Rose Shower Engine
 * Expanded particle bounds and realistic 3D cascading rose petals
 */

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

import(THREE_CDN).then((THREE) => {
    initCinematicUniverse(THREE);
}).catch(err => {
    console.error("3D 浪漫星空引擎加载失败:", err);
    document.body.style.background = "#030208";
});

function initCinematicUniverse(THREE) {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
	// ==========================================
	// 背景音乐系统
	// ==========================================
	// ==========================================
	// 全站无缝背景音乐系统
	// ==========================================
	const bgm = document.getElementById('bgm');
	const musicToggle = document.getElementById('musicToggle');
	
	if (bgm && musicToggle) {
	
	    // 恢复上次播放时间
	    const savedTime = localStorage.getItem('bgm-current-time');
	    const savedPaused = localStorage.getItem('bgm-paused');
	
	    if (savedTime) {
	        bgm.currentTime = parseFloat(savedTime);
	    }
	
	    bgm.volume = 0.45;
	
	    async function startMusic() {
	
	        try {
	
	            // 如果上次不是暂停状态
	            if (savedPaused !== 'true') {
	
	                await bgm.play();
	
	                musicToggle.classList.add('playing');
	
	            }
	
	        } catch (e) {
	
	            console.log('自动播放被阻止');
	
	        }
	
	    }
	
	    // 页面加载后启动
	    window.addEventListener('load', startMusic);
	
	    // 首次点击兼容手机
	    document.body.addEventListener('click', async () => {
	
	        if (bgm.paused) {
	
	            await bgm.play();
	
	            musicToggle.classList.add('playing');
	
	            localStorage.setItem('bgm-paused', 'false');
	
	        }
	
	    }, { once: true });
	
	    // 播放/暂停按钮
	    musicToggle.addEventListener('click', async () => {
	
	        if (bgm.paused) {
	
	            await bgm.play();
	
	            musicToggle.classList.add('playing');
	
	            localStorage.setItem('bgm-paused', 'false');
	
	        } else {
	
	            bgm.pause();
	
	            musicToggle.classList.remove('playing');
	
	            localStorage.setItem('bgm-paused', 'true');
	
	        }
	
	    });
	
	    // 实时记录播放进度
	    setInterval(() => {
	
	        localStorage.setItem(
	            'bgm-current-time',
	            bgm.currentTime
	        );
	
	    }, 1000);
	
	    // 页面关闭前保存
	    window.addEventListener('beforeunload', () => {
	
	        localStorage.setItem(
	            'bgm-current-time',
	            bgm.currentTime
	        );
	
	    });
	
	}

    // --- 1. 初始化广角暗夜场景与景深相机 ---
    const scene = new THREE.Scene();
    
    // 雾化效果：让爱心远端和远处的花瓣自然隐没在黑暗中
    scene.fog = new THREE.FogExp2(0x030208, 0.0045);

    // 将视野 FOV 从 60 扩大到 75，拉近相机，大幅提升粒子的视觉张力和屏幕覆盖范围
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 140; 

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. 核心系统一：全屏幕大范围立体心形星云 ---
    const heartParticleCount = 4500; // 增加粒子量，撑满大视野
    const heartGeometry = new THREE.BufferGeometry();
    const heartPositions = new Float32Array(heartParticleCount * 3);
    const heartColors = new Float32Array(heartParticleCount * 3);
    const heartData = [];

    const heartPalette = [
        new THREE.Color(0xff758c), // 落樱主色
        new THREE.Color(0xff9a9e), // 蜜桃微光
        new THREE.Color(0xfecfef), // 浅粉霓虹
        new THREE.Color(0xa29bfe), // 幽邃星紫
        new THREE.Color(0xffffff)  // 高光纯白
    ];

    for (let i = 0; i < heartParticleCount; i++) {
        const t = Math.PI * 2 * Math.random();
        // 增大随机膨胀系数，使粒子心形的整体大小和扩散外延显著变大
        const r = 0.8 + Math.random() * 0.5; 

        // 放大爱心比例尺（从 3.6 升级到 4.6），使其逼近并部分超越屏幕边界
        const scale3D = 4.6;
        const baseX = 16 * Math.pow(Math.sin(t), 3) * scale3D * r;
        const baseY = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale3D * r;
        
        // 大幅加深 Z 轴前后纵深，让粒子产生穿透屏幕扑面而来的高级立体视差
        const zOffset = (Math.random() - 0.5) * 55 * Math.sin(t); 
        const baseZ = zOffset;

        heartPositions[i * 3] = baseX;
        heartPositions[i * 3 + 1] = baseY;
        heartPositions[i * 3 + 2] = baseZ;

        const pickedColor = heartPalette[Math.floor(Math.random() * heartPalette.length)];
        heartColors[i * 3] = pickedColor.r;
        heartColors[i * 3 + 1] = pickedColor.g;
        heartColors[i * 3 + 2] = pickedColor.b;

        heartData.push({
            x: baseX, y: baseY, z: baseZ, angle: t,
            speed: 0.3 + Math.random() * 0.7,
            waveSeed: Math.random() * Math.PI * 2,
            wobbleRadius: 1.5 + Math.random() * 2.5
        });
    }

    heartGeometry.setAttribute('position', new THREE.BufferAttribute(heartPositions, 3));
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(heartColors, 3));

    // 使用 Canvas 动态绘制高级发光星芒材质
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32; starCanvas.height = 32;
    const starCtx = starCanvas.getContext('2d');
    const starGrad = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    starGrad.addColorStop(0, 'rgba(255,255,255,1)');
    starGrad.addColorStop(0.2, 'rgba(255,255,255,0.6)');
    starGrad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
    starGrad.addColorStop(1, 'rgba(255,255,255,0)');
    starCtx.fillStyle = starGrad;
    starCtx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const heartMaterial = new THREE.PointsMaterial({
        size: 1.4,
        map: starTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        vertexColors: true
    });

    const heartNebula = new THREE.Points(heartGeometry, heartMaterial);
    heartNebula.position.y = -5; 
    scene.add(heartNebula);


    // --- 3. 核心系统二：独立的 3D 玫瑰花瓣飘落系统 ---
    const petalCount = 120; // 花瓣数量
    const petalGeometry = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalColors = new Float32Array(petalCount * 3);
    const petalData = [];

    // 花瓣色系：高雅落樱红、玫瑰深红、娇嫩粉红
    const petalPalette = [
        new THREE.Color(0xff4d6d), // 热情玫瑰
        new THREE.Color(0xff758c), // 浅粉落樱
        new THREE.Color(0xc9184a)  // 丝绒深红
    ];

    for (let i = 0; i < petalCount; i++) {
        // 在宽阔的顶部上方和前后 $Z$ 轴无边界随机散布初始化花瓣
        const px = (Math.random() - 0.5) * 350;
        const py = Math.random() * 200 + 100; // 屏幕上方触发落入
        const pz = (Math.random() - 0.5) * 200;

        petalPositions[i * 3] = px;
        petalPositions[i * 3 + 1] = py;
        petalPositions[i * 3 + 2] = pz;

        const pColor = petalPalette[Math.floor(Math.random() * petalPalette.length)];
        petalColors[i * 3] = pColor.r;
        petalColors[i * 3 + 1] = pColor.g;
        petalColors[i * 3 + 2] = pColor.b;

        petalData.push({
            x: px, y: py, z: pz,
            speedY: 0.6 + Math.random() * 0.9, // 下落速度
            speedX: (Math.random() - 0.5) * 0.4, // 左右微风漂移
            wobbleSpeed: 1 + Math.random() * 1.5, // 摇曳频率
            wobbleRange: 0.3 + Math.random() * 0.5,
            rotationSpeed: 0.02 + Math.random() * 0.05, // 空间翻滚速率
            seed: Math.random() * 100
        });
    }

    petalGeometry.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    petalGeometry.setAttribute('color', new THREE.BufferAttribute(petalColors, 3));

    // 用 Canvas 动态绘制一片精美的高级羽化边缘 3D 玫瑰花瓣纹理
    const petalCanvas = document.createElement('canvas');
    petalCanvas.width = 64; petalCanvas.height = 64;
    const pCtx = petalCanvas.getContext('2d');
    pCtx.clearRect(0, 0, 64, 64);
    
    // 绘制一个优雅平滑的花瓣不规则椭圆几何形状
    pCtx.beginPath();
    pCtx.moveTo(32, 12);
    pCtx.bezierCurveTo(12, 12, 6, 36, 32, 54);
    pCtx.bezierCurveTo(58, 36, 52, 12, 32, 12);
    pCtx.closePath();
    
    // 填充渐变发光，消除硬边，实现高级半透明质感
    const pGrad = pCtx.createRadialGradient(32, 32, 5, 32, 32, 28);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    pGrad.addColorStop(0.9, 'rgba(255,255,255,0.15)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fill();
    const petalTexture = new THREE.CanvasTexture(petalCanvas);

    const petalMaterial = new THREE.PointsMaterial({
        size: 5.5, // 花瓣比一般星星点粒要大，产生完美的近大远小物理视差
        map: petalTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        vertexColors: true
    });

    const roseShower = new THREE.Points(petalGeometry, petalMaterial);
    scene.add(roseShower);


    // --- 4. 惯性视差与鼠标控制 ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 65 };
    
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });


    // --- 5. 渲染循环：复合动态流场动画 ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        const heartPositionsAttr = heartNebula.geometry.attributes.position;
        const petalPositionsAttr = roseShower.geometry.attributes.position;

        // 丝滑的鼠标镜头跟随缓动
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // 星云宏观水平自转 + 鼠标微幅纵向偏转
        heartNebula.rotation.y = time * 0.10 + mouse.x * 0.25;
        heartNebula.rotation.x = mouse.y * 0.15;

        // 玫瑰花瓣系统整体也做极其轻微的同步偏转，保持空间一体性
        roseShower.rotation.y = time * 0.03 + mouse.x * 0.1;

        // A. 实时更新：爱心粒子流场
        for (let i = 0; i < heartParticleCount; i++) {
            const data = heartData[i];
            let curX = data.x;
            let curY = data.y;
            let curZ = data.z;

            // 微风流动波浪
            const wave = Math.sin(time * data.speed + data.waveSeed) * data.wobbleRadius;
            curX += Math.cos(data.angle) * wave;
            curY += Math.sin(data.angle) * wave;
            curZ += Math.sin(time * 0.5 + data.waveSeed) * 2;

            // 整体心跳优雅收缩呼吸
            const pulse = 1 + Math.sin(time * 1.5 + data.waveSeed * 0.1) * 0.02;
            curX *= pulse; curY *= pulse; curZ *= pulse;

            // 鼠标空间物理涟漪避让
            const mX3D = mouse.x * 130;
            const mY3D = mouse.y * 100;
            const dx = curX - mX3D; const dy = curY - mY3D;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                curX += (dx / dist) * force * 15;
                curY += (dy / dist) * force * 15;
                curZ += force * 18; 
            }

            heartPositionsAttr.setXYZ(i, curX, curY, curZ);
        }
        heartPositionsAttr.needsUpdate = true;

        // B. 实时更新：3D 玫瑰花瓣落体动力学
        for (let i = 0; i < petalCount; i++) {
            const pData = petalData[i];

            let px = petalPositionsAttr.getX(i);
            let py = petalPositionsAttr.getY(i);
            let pz = petalPositionsAttr.getZ(i);

            // 自上而下匀速落体运动
            py -= pData.speedY;
            // 叠加风力左右微调
            px += pData.speedX + Math.sin(time * pData.wobbleSpeed + pData.seed) * pData.wobbleRange;
            // Z 轴前后微幅晃动，模拟在空气中的轻盈翻滚
            pz += Math.cos(time * pData.wobbleSpeed * 0.5) * 0.2;

            // 边界再生循环：如果花瓣落到屏幕最下方以外，无缝让它从顶部重新生成落下
            if (py < -150) {
                py = 150;
                px = (Math.random() - 0.5) * 350;
                pz = (Math.random() - 0.5) * 200;
                pData.speedY = 0.6 + Math.random() * 0.9;
            }

            petalPositionsAttr.setXYZ(i, px, py, pz);
        }
        petalPositionsAttr.needsUpdate = true;

        renderer.render(scene, camera);
    }

    // --- 6. 视口响应式弹性缩放 ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    animate();
}