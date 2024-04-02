{
    path: '/task',
    component: Layout,
    name: 'Task',
    redirect: '/task/task',
    meta: { title: '任务管理', icon: 'statistic' },
    children: [{
      path: 'task',
      component: () => import('@/views/task/index'),
      name: 'TaskTask',
      meta: { title: '任务列表' },
      children: [{
        path: '',
        component: () => import('@/views/task/task/list'),
        name: 'TaskTaskList',
        meta: { title: '列表' },
        hidden: true
      }, {
        path: 'detail',
        component: () => import('@/views/task/task/detail'),
        name: 'TaskTaskDetail',
        meta: { title: '详情' },
        hidden: true
      }]
    }, {
      path: 'mine',
      component: () => import('@/views/task/index'),
      name: 'TaskMine',
      meta: { title: '我的任务' },
      children: [{
        path: '',
        component: () => import('@/views/task/mine/list'),
        name: 'TaskMineList',
        meta: { title: '列表' },
        hidden: true
      }, {
        path: 'detail',
        component: () => import('@/views/task/mine/detail'),
        name: 'TaskMineDetail',
        meta: { title: '详情' },
        hidden: true
      }]
    }]
  }